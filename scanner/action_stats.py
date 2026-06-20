from scanner.action_logger import load_actions


def get_action_stats():

    actions = load_actions()

    blocked = 0
    unblocked = 0
    restricted = 0
    restriction_removed = 0

    for action in actions:

        if action["type"] == "device_blocked":
            blocked += 1

        elif action["type"] == "device_unblocked":
            unblocked += 1

        elif action["type"] == "device_restricted":
            restricted += 1

        elif action["type"] == "restriction_removed":
            restriction_removed += 1

    return {
        "total_actions": len(actions),
        "devices_blocked": blocked,
        "devices_unblocked": unblocked,
        "devices_restricted": restricted,
        "restrictions_removed": restriction_removed
    }