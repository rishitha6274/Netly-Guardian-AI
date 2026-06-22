from scanner.curfew_checker import check_curfews

alerts = check_curfews()

print("\nCurfew Alerts\n")

for alert in alerts:
    print(alert)