from scanner.auto_enforcer import enforce_rules

print("\nEnforcement Actions\n")

for action in enforce_rules():
    print(action)