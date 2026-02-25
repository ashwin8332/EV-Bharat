#include <BluetoothSerial.h>

BluetoothSerial SerialBT;

/*************** MOTOR PINS ***************/
int enableRightMotor = 33;
int rightMotorPin1   = 13;
int rightMotorPin2   = 27;

int enableLeftMotor  = 14;
int leftMotorPin1    = 25;
int leftMotorPin2    = 26;

#define MAX_MOTOR_SPEED 255
#define TURN_SPEED      180

/*************** TELEMETRY ***************/
unsigned long lastTelemetry = 0;
const long telemetryInterval = 1000;
int batteryLevel = 87;
float temperature = 25.5;
bool isMoving = false;
String currentDirection = "STOP";

/*************** SETUP ***************/
void setup()
{
  Serial.begin(115200);
  SerialBT.begin("ESP32_V2E_CAR");

  pinMode(rightMotorPin1, OUTPUT);
  pinMode(rightMotorPin2, OUTPUT);
  pinMode(leftMotorPin1,  OUTPUT);
  pinMode(leftMotorPin2,  OUTPUT);

  // NEW PWM method for ESP32 v3.x
  ledcAttach(enableRightMotor, 1000, 8);
  ledcAttach(enableLeftMotor,  1000, 8);

  stopMotors();

  Serial.println("Bluetooth Car Ready");
  SerialBT.println("{\"status\":\"ready\"}");
}

/*************** LOOP ***************/
void loop()
{
  if (SerialBT.available()) {
    String command = SerialBT.readStringUntil('\n');
    command.trim();
    handleCommand(command);
  }

  if (millis() - lastTelemetry >= telemetryInterval) {
    lastTelemetry = millis();
    sendTelemetry();
  }
}

/*************** COMMAND HANDLER ***************/
void handleCommand(String cmd) {

  if (cmd == "FORWARD") moveForward();
  else if (cmd == "BACKWARD") moveBackward();
  else if (cmd == "LEFT") turnLeft();
  else if (cmd == "RIGHT") turnRight();
  else if (cmd == "STOP") stopMotors();
  else if (cmd == "STATUS") sendTelemetry();
}

/*************** MOTOR FUNCTIONS ***************/
void moveForward() {
  digitalWrite(rightMotorPin1, HIGH);
  digitalWrite(rightMotorPin2, LOW);
  digitalWrite(leftMotorPin1,  HIGH);
  digitalWrite(leftMotorPin2,  LOW);
  ledcWrite(enableRightMotor, MAX_MOTOR_SPEED);
  ledcWrite(enableLeftMotor,  MAX_MOTOR_SPEED);
  currentDirection = "FORWARD";
  isMoving = true;
}

void moveBackward() {
  digitalWrite(rightMotorPin1, LOW);
  digitalWrite(rightMotorPin2, HIGH);
  digitalWrite(leftMotorPin1,  LOW);
  digitalWrite(leftMotorPin2,  HIGH);
  ledcWrite(enableRightMotor, MAX_MOTOR_SPEED);
  ledcWrite(enableLeftMotor,  MAX_MOTOR_SPEED);
  currentDirection = "BACKWARD";
  isMoving = true;
}

void turnRight() {
  digitalWrite(rightMotorPin1, LOW);
  digitalWrite(rightMotorPin2, LOW);
  digitalWrite(leftMotorPin1,  HIGH);
  digitalWrite(leftMotorPin2,  LOW);
  ledcWrite(enableRightMotor, 0);
  ledcWrite(enableLeftMotor,  MAX_MOTOR_SPEED);
  currentDirection = "RIGHT";
  isMoving = true;
}

void turnLeft() {
  digitalWrite(rightMotorPin1, HIGH);
  digitalWrite(rightMotorPin2, LOW);
  digitalWrite(leftMotorPin1,  LOW);
  digitalWrite(leftMotorPin2,  LOW);
  ledcWrite(enableRightMotor, MAX_MOTOR_SPEED);
  ledcWrite(enableLeftMotor,  0);
  currentDirection = "LEFT";
  isMoving = true;
}

void stopMotors() {
  digitalWrite(rightMotorPin1, LOW);
  digitalWrite(rightMotorPin2, LOW);
  digitalWrite(leftMotorPin1,  LOW);
  digitalWrite(leftMotorPin2,  LOW);
  ledcWrite(enableRightMotor, 0);
  ledcWrite(enableLeftMotor,  0);
  currentDirection = "STOP";
  isMoving = false;
}

/*************** TELEMETRY ***************/
void sendTelemetry() {

  if (isMoving && batteryLevel > 0) {
    batteryLevel -= random(0, 2);
  }

  temperature = 25.0 + random(-10, 30) / 10.0;

  String json = "{";
  json += "\"battery\":" + String(batteryLevel) + ",";
  json += "\"temperature\":" + String(temperature,1) + ",";
  json += "\"direction\":\"" + currentDirection + "\",";
  json += "\"moving\":" + String(isMoving ? "true":"false") + ",";
  json += "\"timestamp\":" + String(millis());
  json += "}";

  Serial.println(json);
  SerialBT.println(json);
}