from unstructured.partition.pdf import partition_pdf
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough,RunnableLambda

from langchain.storage import InMemoryByteStore
from langchain.schema.document import Document
from pathlib import Path
from IPython.display import display, HTML
from base64 import b64decode
import os, hashlib, shutil, uuid, json, time
import torch, streamlit as st
import logging


from dotenv import load_dotenv
load_dotenv()

# Ensure PyTorch module path is correctly set
torch.classes.__path__ = [os.path.join(torch.__path__[0], torch.classes.__file__)] 

# Configure logging
logging.basicConfig(level=logging.INFO)

# Simple in-memory storage (no external dependencies)
class SimpleInMemoryRetriever:
    def __init__(self):
        self.documents = []
        self.summaries = []
        
    def add_documents(self, docs, summaries):
        self.documents.extend(docs)
        self.summaries.extend(summaries)
        
    def invoke(self, query):
        # Simple retrieval: return first few relevant documents
        return self.documents[:min(3, len(self.documents))]




#Data Loading
def load_pdf_data(file_path):
    logging.info(f"Data ready to be partitioned and loaded ")
    raw_pdf_elements = partition_pdf(
        filename=file_path,
      
        infer_table_structure=True,
        strategy = "fast",  # Changed from "hi_res" to avoid poppler dependency
        
        extract_image_block_types = ["Image"],
        extract_image_block_to_payload  = True,

        chunking_strategy="by_title",     
        mode='elements',
        max_characters=10000,
        new_after_n_chars=5000,
        combine_text_under_n_chars=2000,
        image_output_dir_path="data/",
    )
    logging.info(f"Pdf data finish loading, chunks now available!")
    return raw_pdf_elements

# Generate a unique hash for a PDF file
def get_pdf_hash(pdf_path):
    """Generate a SHA-256 hash of the PDF file content."""
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()
    return hashlib.sha256(pdf_bytes).hexdigest()

# Summarize extracted text and tables using LLM
def summarize_text_and_tables(text, tables):
    logging.info("Ready to summarize data with LLM")
    prompt_text = """You are an assistant tasked with summarizing text and tables. \
    
                    You are to give a concise summary of the table or text and do nothing else. 
                    Table or text chunk: {element} """
    prompt = ChatPromptTemplate.from_template(prompt_text)
    model = ChatGoogleGenerativeAI(temperature=0.6, model="gemini-2.5-flash")
    summarize_chain = {"element": RunnablePassthrough()}| prompt | model | StrOutputParser()
    logging.info(f"{model} done with summarization")
    return {
        "text": summarize_chain.batch(text, {"max_concurrency": 5}),
        "table": summarize_chain.batch(tables, {"max_concurrency": 5})
    }
  
# Initialize simple in-memory retriever (no database dependencies)
def initialize_retriever():
    print("Creating simple in-memory retriever (no dependencies)...")
    retriever = SimpleInMemoryRetriever()
    print("✅ Simple in-memory retriever initialized successfully")
    return retriever


# Store text, tables, and their summaries in the retriever

def store_docs_in_retriever(text, text_summary, table, table_summary, retriever):
    """Store text and table documents along with their summaries in the simple retriever."""
    
    print(f"Storing {len(text)} text documents and {len(table)} table documents...")
    
    # Add text documents and summaries
    if text and text_summary:
        retriever.add_documents(text, text_summary)
        
    # Add table documents and summaries  
    if table and table_summary:
        retriever.add_documents(table, table_summary)
        
    print(f"✅ Stored total {len(retriever.documents)} documents in simple retriever")
    return retriever


# Parse the retriever output
def parse_retriver_output(data):
    parsed_elements = []
    for element in data:
        # Decode bytes to string if necessary
        if isinstance(element, bytes):
            element = element.decode("utf-8")
        
        parsed_elements.append(element)
    
    return parsed_elements


# Chat with the LLM using retrieved context

def chat_with_llm(retriever):
    logging.info("Setting up simple chat function...")
    
    prompt_text = """
                You are an AI Assistant tasked with understanding detailed
                information from text and tables. You are to answer the question based on the 
                context provided to you. You must not go beyond the context given to you.
                
                Context:
                {context}

                Question:
                {question}
                """

    prompt = ChatPromptTemplate.from_template(prompt_text)
    model = ChatGoogleGenerativeAI(temperature=0.6, model="gemini-2.5-flash")

    def simple_rag_chain(question):
        # Get context from simple retriever
        docs = retriever.invoke(question)
        context = "\n\n".join(docs)
        
        # Format prompt and get response
        formatted_prompt = prompt.format(context=context, question=question)
        response = model.invoke(formatted_prompt)
        
        return response.content

    logging.info("✅ Simple RAG chain ready!")
    return simple_rag_chain

# Generate temporary file path of uploaded docs
def _get_file_path(file_upload):

    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)  # Ensure the directory exists

    if isinstance(file_upload, str):
        file_path = file_upload  # Already a string path
    else:
        file_path = os.path.join(temp_dir, file_upload.name)
        with open(file_path, "wb") as f:
            f.write(file_upload.getbuffer())
        return file_path
    

# Process uploaded PDF file
def process_pdf(file_upload):
    print('Processing PDF...')
    
    file_path = _get_file_path(file_upload)
    
    # Initialize retriever
    load_retriever = initialize_retriever()
    
    print("Loading PDF data...")
    pdf_elements = load_pdf_data(file_path)
    
    # Extract text from all elements since "fast" strategy doesn't separate tables
    text = []
    tables = []
    
    for element in pdf_elements:
        element_text = element.text if hasattr(element, 'text') else str(element)
        
        # Simple heuristic: if text has multiple tabs/spaces in rows, treat as table-like
        lines = element_text.split('\n')
        tab_lines = sum(1 for line in lines if '\t' in line or '  ' in line)
        
        if tab_lines > 1 and len(lines) > 2:  # Likely tabular data
            tables.append(element_text)
        else:
            text.append(element_text)
    
    print(f"Extracted {len(text)} text elements and {len(tables)} table elements")
    
    # Create simplified summaries (first 200 chars to avoid API quota issues)
    text_summary = [txt[:200] + "..." if len(txt) > 200 else txt for txt in text]
    tables_summary = [tbl[:200] + "..." if len(tbl) > 200 else tbl for tbl in tables]
    
    # Store documents in retriever
    retriever = store_docs_in_retriever(text, text_summary, tables, tables_summary, load_retriever)
    
    print("✅ PDF processing completed!")
    return retriever


#Invoke chat with LLM based on uploaded PDF and user query
def invoke_chat(file_upload, message):
    retriever = process_pdf(file_upload)
    rag_chain = chat_with_llm(retriever)
    response = rag_chain(message)  # Call function directly, not .invoke()
    response_placeholder = st.empty()
    response_placeholder.write(response)
    return response


# Main application interface using Streamlit
def main():
  
    st.title("EVBharat Bot")
    logging.info("App started")

    if 'messages' not in st.session_state:
        st.session_state.messages = []

 
    file_upload = st.sidebar.file_uploader(
    label="Upload", type=["pdf"], 
    accept_multiple_files=False,
    key="pdf_uploader"
    )

    if file_upload:     
        st.success("File uploaded successfully! You can now ask your question.")

    # Prompt for user input
    if prompt := st.chat_input("Your question"):
        st.session_state.messages.append({"role": "user", "content": prompt})

    # Display chat history
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.write(message["content"])

    # Generate response if last message is not from assistant
    if st.session_state.messages and st.session_state.messages[-1]["role"] != "assistant":
        with st.chat_message("assistant"):
            start_time = time.time()
            logging.info("Generating response...")
            with st.spinner("Processing..."):
                user_message = " ".join([msg["content"] for msg in st.session_state.messages if msg])           
                response_message = invoke_chat(file_upload, user_message)
        
                duration = time.time() - start_time
                response_msg_with_duration = f"{response_message}\n\nDuration: {duration:.2f} seconds"

                st.session_state.messages.append({"role": "assistant", "content": response_msg_with_duration})
                st.write(f"Duration: {duration:.2f} seconds")
                logging.info(f"Response: {response_message}, Duration: {duration:.2f} s")



if __name__ == "__main__":
    main()