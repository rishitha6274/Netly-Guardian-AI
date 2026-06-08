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


if __name__ == "__main__":
    network = "192.168.1.0/24"

    print(f"\nScanning network: {network}\n")

    devices = scan_network(network)

    print("Connected Devices")
    print("-" * 40)

    for device in devices:
        print(f"IP : {device['ip']}")
        print(f"MAC: {device['mac']}")
        print("-" * 40)

    # Save results to JSON
    with open("database/devices.json", "w") as file:
        json.dump(devices, file, indent=4)

    print("\nResults saved to database/devices.json")