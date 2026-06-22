import json

NOTES_FILE = "database/device_notes.json"


def load_notes():

    try:
        with open(NOTES_FILE, "r") as file:
            return json.load(file)

    except FileNotFoundError:
        return {}


def save_notes(notes):

    with open(NOTES_FILE, "w") as file:
        json.dump(notes, file, indent=4)


def add_note(mac, note):

    notes = load_notes()

    notes[mac.lower()] = note

    save_notes(notes)

    return {
        "mac": mac,
        "note": note
    }


def get_note(mac):

    notes = load_notes()

    return notes.get(mac.lower(), "")