from scanner.port_scanner import scan_ports
from scanner.risk_engine import calculate_risk


router_ip = "192.168.1.1"

ports = scan_ports(router_ip)

risk_level, risks = calculate_risk(ports)

print("\nOpen Ports:")
print(ports)

print("\nRisk Level:")
print(risk_level)

print("\nDetected Risks:")
print(risks)