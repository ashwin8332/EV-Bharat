/*************** SIMPLE VERSION - DABBLE ONLY ***************/
// This version works without BluetoothSerial - uses only Dabble library
// Use this if you're having Bluetooth compilation issues

#define CUSTOM_SETTINGS
#define INCLUDE_GAMEPAD_MODULE
#include <DabbleESP32.h>

/*************** MOTOR PINS ***************/
int enableRightMotor = 33;  // ENA
int rightMotorPin1   = 13;  // IN1
int rightMotorPin2   = 27;  // IN2

int enableLeftMotor  = 14;  // ENB
int leftMotorPin1    = 25;  // IN3
int leftMotorPin2    = 26;  // IN4

#define MAX_MOTOR_SPEED 255
#define TURN_SPEED      180
#define PWM_FREQ        1000
#define PWM_RESOLUTION  8

/*************** SETUP ***************/
void setup()
{
  Serial.begin(115200);
  
  pinMode(rightMotorPin1, OUTPUT);
  pinMode(rightMotorPin2, OUTPUT);
  pinMode(leftMotorPin1,  OUTPUT);
  pinMode(leftMotorPin2,  OUTPUT);

  ledcAttach(enableRightMotor, PWM_FREQ, PWM_RESOLUTION);
  ledcAttach(enableLeftMotor,  PWM_FREQ, PWM_RESOLUTION);

  digitalWrite(rightMotorPin1, LOW);
  digitalWrite(rightMotorPin2, LOW);
  digitalWrite(leftMotorPin1,  LOW);
  digitalWrite(leftMotorPin2,  LOW);
  ledcWrite(enableRightMotor, 0);
  ledcWrite(enableLeftMotor,  0);

  Dabble.begin("ESP32_V2E_CAR");
  Serial.println("Bluetooth Car Ready - Dabble Mode");
}

/*************** LOOP ***************/
void loop()
{
  Dabble.processInput();
  processGamepadControls();
}

/*************** MOTOR CONTROL FUNCTIONS ***************/
void moveForward() {
  digitalWrite(rightMotorPin1, HIGH);
  digitalWrite(rightMotorPin2, LOW);
  digitalWrite(leftMotorPin1,  HIGH);
  digitalWrite(leftMotorPin2,  LOW);
  ledcWrite(enableRightMotor, MAX_MOTOR_SPEED);
  ledcWrite(enableLeftMotor,  MAX_MOTOR_SPEED);
  Serial.println("FORWARD");
}

void moveBackward() {
  digitalWrite(rightMotorPin1, LOW);
  digitalWrite(rightMotorPin2, HIGH);
  digitalWrite(leftMotorPin1,  LOW);
  digitalWrite(leftMotorPin2,  HIGH);
  ledcWrite(enableRightMotor, MAX_MOTOR_SPEED);
  ledcWrite(enableLeftMotor,  MAX_MOTOR_SPEED);
  Serial.println("BACKWARD");
}

void turnRight() {
  digitalWrite(rightMotorPin1, LOW);
  digitalWrite(rightMotorPin2, LOW);
  digitalWrite(leftMotorPin1,  HIGH);
  digitalWrite(leftMotorPin2,  LOW);
  ledcWrite(enableRightMotor, 0);
  ledcWrite(enableLeftMotor,  MAX_MOTOR_SPEED);
  Serial.println("RIGHT");
}

void turnLeft() {
  digitalWrite(rightMotorPin1, HIGH);
  digitalWrite(rightMotorPin2, LOW);
  digitalWrite(leftMotorPin1,  LOW);
  digitalWrite(leftMotorPin2,  LOW);
  ledcWrite(enableRightMotor, MAX_MOTOR_SPEED);
  ledcWrite(enableLeftMotor,  0);
  Serial.println("LEFT");
}

void stopMotors() {
  digitalWrite(rightMotorPin1, LOW);
  digitalWrite(rightMotorPin2, LOW);
  digitalWrite(leftMotorPin1,  LOW);
  digitalWrite(leftMotorPin2,  LOW);
  ledcWrite(enableRightMotor, 0);
  ledcWrite(enableLeftMotor,  0);
  Serial.println("STOP");
}

/*************** GAMEPAD CONTROLS ***************/
void processGamepadControls() {
  if (GamePad.isUpPressed() && !GamePad.isLeftPressed() && !GamePad.isRightPressed()) {
    moveForward();
  }
  else if (GamePad.isDownPressed() && !GamePad.isLeftPressed() && !GamePad.isRightPressed()) {
    moveBackward();
  }
  else if (GamePad.isRightPressed() && !GamePad.isUpPressed() && !GamePad.isDownPressed()) {
    turnRight();
  }
  else if (GamePad.isLeftPressed() && !GamePad.isUpPressed() && !GamePad.isDownPressed()) {
    turnLeft();
  }
  else if (GamePad.isUpPressed() && GamePad.isLeftPressed()) {
    // FORWARD + LEFT arc
    digitalWrite(rightMotorPin1, HIGH);
    digitalWrite(rightMotorPin2, LOW);
    digitalWrite(leftMotorPin1,  HIGH);
    digitalWrite(leftMotorPin2,  LOW);
    ledcWrite(enableRightMotor, MAX_MOTOR_SPEED);
    ledcWrite(enableLeftMotor,  TURN_SPEED);
  }
  else if (GamePad.isUpPressed() && GamePad.isRightPressed()) {
    // FORWARD + RIGHT arc
    digitalWrite(rightMotorPin1, HIGH);
    digitalWrite(rightMotorPin2, LOW);
    digitalWrite(leftMotorPin1,  HIGH);
    digitalWrite(leftMotorPin2,  LOW);
    ledcWrite(enableRightMotor, TURN_SPEED);
    ledcWrite(enableLeftMotor,  MAX_MOTOR_SPEED);
  }
  else if (GamePad.isDownPressed() && GamePad.isLeftPressed()) {
    // BACKWARD + LEFT arc
    digitalWrite(rightMotorPin1, LOW);
    digitalWrite(rightMotorPin2, HIGH);
    digitalWrite(leftMotorPin1,  LOW);
    digitalWrite(leftMotorPin2,  HIGH);
    ledcWrite(enableRightMotor, MAX_MOTOR_SPEED);
    ledcWrite(enableLeftMotor,  TURN_SPEED);
  }
  else if (GamePad.isDownPressed() && GamePad.isRightPressed()) {
    // BACKWARD + RIGHT arc
    digitalWrite(rightMotorPin1, LOW);
    digitalWrite(rightMotorPin2, HIGH);
    digitalWrite(leftMotorPin1,  LOW);
    digitalWrite(leftMotorPin2,  HIGH);
    ledcWrite(enableRightMotor, TURN_SPEED);
    ledcWrite(enableLeftMotor,  MAX_MOTOR_SPEED);
  }
  else {
    stopMotors();
  }
}
