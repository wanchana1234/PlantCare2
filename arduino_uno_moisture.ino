int sensorPin = A0;
int moistureValue = 0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  moistureValue = analogRead(sensorPin);
  Serial.println(moistureValue);
  delay(1000);
}