def calculate_risk(open_ports):

    risky_ports = {
        21: "FTP",
        23: "Telnet",
        445: "SMB",
        3389: "RDP",
        5900: "VNC"
    }

    detected_risks = []

    for port in open_ports:

        if port in risky_ports:
            detected_risks.append(risky_ports[port])

    if len(detected_risks) == 0:
        risk_level = "LOW"

    elif len(detected_risks) <= 2:
        risk_level = "MEDIUM"

    else:
        risk_level = "HIGH"

    return risk_level, detected_risks