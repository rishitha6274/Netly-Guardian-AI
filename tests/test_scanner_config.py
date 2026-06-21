from scanner.scanner_config import (
    save_scanner_config,
    load_scanner_config
)

save_scanner_config(
    "user123",
    "scanner123"
)

print(
    load_scanner_config()
)