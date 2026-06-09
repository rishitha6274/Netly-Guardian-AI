import nmap


def scan_ports(ip):

    scanner = nmap.PortScanner()

    scanner.scan(ip, arguments="-F")

    open_ports = []

    for host in scanner.all_hosts():

        if "tcp" in scanner[host]:

            for port in scanner[host]["tcp"]:

                state = scanner[host]["tcp"][port]["state"]

                if state == "open":

                    open_ports.append(port)

    return open_ports