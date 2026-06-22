import json

CONFIG_FILE = "database/scanner_config.json"


def load_scanner_config():

    with open(CONFIG_FILE, "r") as file:
        return json.load(file)


def save_scanner_config(
    user_id,
    scanner_id
):

    with open(CONFIG_FILE, "w") as file:

        json.dump(
            {
                "user_id": user_id,
                "scanner_id": scanner_id
            },
            file,
            indent=4
        )