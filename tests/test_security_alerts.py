from scanner.alert_engine import generate_security_alerts

alerts = generate_security_alerts()

print("\nSecurity Alerts\n")

for alert in alerts:
    print(alert)