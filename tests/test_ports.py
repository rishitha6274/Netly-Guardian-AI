from scanner.port_scanner import scan_ports


router_ip = "192.168.1.1"

ports = scan_ports(router_ip)

print("\nOpen Ports")

for port in ports:
    print(port)