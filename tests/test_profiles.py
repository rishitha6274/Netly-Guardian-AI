from scanner.device_profiles import get_device_profiles

profiles = get_device_profiles()

print("\nDevice Profiles\n")

for profile in profiles:
    print(profile)