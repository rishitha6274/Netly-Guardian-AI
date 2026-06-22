from scanner.device_trust import calculate_trust_scores

devices = calculate_trust_scores()

print("\nTrust Scores\n")

for device in devices:
    print(device)