#include <SoftwareSerial.h>
#include <Servo.h>

Servo servo;

//SoftwareSerial mySerial(7, 8); // RX, TX
// Connect HM10      Arduino Uno
//     Pin 1/TXD          Pin 7
//     Pin 2/RXD          Pin 8

#define enable    8
#define xStep     2
#define yStep     3
#define zStep     4 
#define xDir      5
#define yDir      6
#define zDir      7

#define servoPin  31

#define limY1      52
#define limX1      51
#define limY2      50
#define limZ       49
#define limX2      48

int pos = 0;

int steps = 100;
int stepDelay = 500;

int angle = 0;
int a = 1;

void motorMove(boolean dir, byte dirPin, byte stepperPin, int steps){
    digitalWrite(dirPin, dir);
    for (int i=0; i < steps; i++){
      digitalWrite(stepperPin, HIGH);
      delayMicroseconds(stepDelay);
      digitalWrite(stepperPin, LOW);
      delayMicroseconds(stepDelay);
    }
}

void setup() {  
  Serial.begin(9600);
  // If the baudrate of the HM-10 module has been updated,
  // you may need to change 9600 by another value
  // Once you have found the correct baudrate,
  // you can update it using AT+BAUDx command 
  // e.g. AT+BAUD0 for 9600 bauds
  Serial1.begin(9600);
  Serial.write("Ready, type AT commands\n\n");

  servo.attach(servoPin);
  
  pinMode(limX1, INPUT);
  pinMode(limX2, INPUT);
  pinMode(limY1, INPUT);
  pinMode(limY1, INPUT);
  pinMode(limZ, INPUT);
  
  pinMode(xStep,OUTPUT);
  pinMode(yStep,OUTPUT);
  pinMode(zStep,OUTPUT);
  pinMode(xDir,OUTPUT);
  pinMode(yDir,OUTPUT);
  pinMode(zDir,OUTPUT);
  
  pinMode(enable, OUTPUT);
  digitalWrite(enable, LOW);
 
}

void loop() { 

  char c;
  
  if (Serial.available()) {
    Serial.write("arduino: ");
    c = Serial.read();
    Serial1.write(c);
//    Serial.write(c);
  }
  if (Serial1.available()) {
    Serial.write("ble: ");
    c = Serial1.read();
    Serial.println(c);
    
    if (c=='R'){
      if (digitalRead(limX2) == HIGH){
        motorMove(false, xDir, xStep, steps);
      }
    }
    if (c=='L'){
      Serial.println(digitalRead(limY2));
      if (digitalRead(limY2) == HIGH){
        motorMove(true, xDir, xStep, steps); 
      }
//      motorMove(true, xDir, xStep, steps); 
    }
    if (c=='U'){
      if (digitalRead(limY2) == HIGH){
        motorMove(true, yDir, yStep, 100);
      }
    }
    if (c=='D'){
      if (digitalRead(limY1) == HIGH){
          motorMove(false, yDir, yStep, 100);
        }
      }
    if (c=='G'){
      grabOpen();
      motorMove(false, zDir, zStep, 1500);
      grabClose();
      motorMove(true, zDir, zStep, 1500);
      initialize();
      drop();
    }
  }
}

// drop the claw
void drop(){
  grabOpen();
  grabClose();
}

// servo claw grab
void grabOpen(){
  for (pos = 0; pos <= 80; pos += 1) { // goes from 0 degrees to 180 degrees
    // in steps of 1 degree
    servo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position
  }
}

void grabClose(){
  for (pos = 90; pos >= 0; pos -= 1) { // goes from 180 degrees to 0 degrees
    servo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position
  }
}

void initialize(){
  // x and y to dropping point
  // move left until hit the limit switch
  while (digitalRead(limY2) == HIGH){
    motorMove(true, xDir, xStep, 100); 
  }
//  // move down until hit the limit switch
  while (digitalRead(limY1) == HIGH){
    motorMove(false, yDir, yStep, 100);
  }
}

