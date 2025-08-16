// Arduino UNO/Nano moisture sender
const int SENSOR_PIN = A0;
int DRY = 800;
int WET = 300;

void setup(){ Serial.begin(9600); pinMode(SENSOR_PIN, INPUT); }
void loop(){
  int raw = analogRead(SENSOR_PIN);
  int pct = map(raw, DRY, WET, 0, 100);
  if (pct < 0) pct = 0;
  if (pct > 100) pct = 100;
  Serial.print("{\"moisture\":"); Serial.print(pct); Serial.println("}");
  delay(1000);
}
