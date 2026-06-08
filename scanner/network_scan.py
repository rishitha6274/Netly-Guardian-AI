from scapy.all import ARP, Ether, srp
import json


def scan_network(ip_range):
    arp_request = ARP(pdst=ip_range)

    broadcast = Ether(dst="ff:ff:ff:ff:ff:ff")

    packet = broadcast / arp_request

    result = srp(packet, timeout=2, verbose=False)[0]

    devices = []

    for sent, received in result:
        devices.append({
            "ip": received.psrc,
            "mac": received.hwsrc
        })

    return devices


def load_known_devices():
    with open("database/known_devices.json", "r") as file:
        return json.load(file)


def check_devices(devices, known_devices):

    known_macs = {}

    for device in known_devices:
        known_macs[device["mac"].lower()] = device["name"]

    print("\nDevice Status")
    print("=" * 40)

    for device in devices:

        mac = device["mac"].lower()

        if mac in known_macs:
            print(f"✓ Known Device: {known_macs[mac]}")
            print(f"  IP : {device['ip']}")
            print(f"  MAC: {device['mac']}")
        else:
            print("⚠ UNKNOWN DEVICE DETECTED")
            print(f"  IP : {device['ip']}")
            print(f"  MAC: {device['mac']}")

        print("-" * 40)


if __name__ == "__main__":

    network = "192.168.1.0/24"

    print(f"\nScanning network: {network}\n")

    devices = scan_network(network)

    with open("database/devices.json", "w") as file:
        json.dump(devices, file, indent=4)

    print("Results saved to database/devices.json")

    known_devices = load_known_devices()

    check_devices(devices, known_devices)