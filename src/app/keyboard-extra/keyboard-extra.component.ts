import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { invoke } from "@tauri-apps/api/core";
import { ChangeDetectorRef } from '@angular/core';


interface Key {
    label: string;
    originalLabel: string;
    class: string;
    state: string;
    width?: number;
    isRemapped?: boolean;
}

interface RemapConfigKey {
    make_code: number;
    make_code_hex: string;
    flags: number;
    flags_decoded?: string[];
}

interface RemapConfig {
    index: number;
    left_ctrl: string;
    left_alt: string;
    search: string;
    assistant: string;
    left_shift: string;
    right_ctrl: string;
    right_alt: string;
    right_shift: string;
    original_key: RemapConfigKey;
    remap_vivaldi_to_fn: boolean;
    remapped_key?: RemapConfigKey | null;
    additional_keys?: RemapConfigKey[];
}

interface ConfigFileJson {
    magic: string;
    magic_hex: string;
    valid: boolean;
    remappings: number;
    flip_search_and_assistant_on_pixelbook: boolean;
    has_assistant_key: string;
    is_non_chrome_ec: string;
    file_size_bytes: number;
    expected_size_bytes: number;
    configs: RemapConfig[];
}

@Component({
    selector: "app-keyboard-extra",
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: "./keyboard-extra.component.html",
    styleUrl: "./keyboard-extra.component.scss"
})
export class KeyboardExtraComponent {
    constructor(private cdr: ChangeDetectorRef)
    {
        this.updateHexFromRgb();
    }

    // RGB Controls
    rgbEnabled: boolean = true;
    brightness: number = 80;
    private _rgbRed: number = 255;
    private _rgbGreen: number = 100;
    private _rgbBlue: number = 255;
    private _hexCodeInput: string = 'FF64FF';
    rgbMode: string = "static";
    
    // Button states
    default_button_state: string = "btn-outline-secondary";
    changed_button_state: string = "btn-outline-warning";
    
    // Remap mode
    remapMode: boolean = false;
    selectedKeyIndex: { row: number, col: number } | null = null;
    remapInput: string = "";
    current_remap: RemapConfig[] = [];
    fullConfig: ConfigFileJson | null = null;

    // Table view state
    showTableView: boolean = true;
    editingCell: { rowIndex: number, field: string } | null = null;

    // Valid options from Rust code
    keyStateOptions = ["NoDetect", "Enforce", "EnforceNot"];
    modifierFields = [
        'left_ctrl', 'left_alt', 'search', 'assistant',
        'left_shift', 'right_ctrl', 'right_alt', 'right_shift'
    ];

    ngOnInit()
    {
        this.getRemappedKeys();
    }

    keyboardLayout: Key[][] = [
        // Row 1 - Function keys
        [
            { label: "Esc", originalLabel: "Esc", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "F1", originalLabel: "F1", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "F2", originalLabel: "F2", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "F3", originalLabel: "F3", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "F4", originalLabel: "F4", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "F5", originalLabel: "F5", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "F6", originalLabel: "F6", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "F7", originalLabel: "F7", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "F8", originalLabel: "F8", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "F9", originalLabel: "F9", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "F10", originalLabel: "F10", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "F11", originalLabel: "F11", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "F12", originalLabel: "F12", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "Del", originalLabel: "Del", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false }
        ],
        // Row 2 - Number row
        [
            { label: "`", originalLabel: "`", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "1", originalLabel: "1", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "2", originalLabel: "2", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "3", originalLabel: "3", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "4", originalLabel: "4", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "5", originalLabel: "5", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "6", originalLabel: "6", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "7", originalLabel: "7", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "8", originalLabel: "8", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "9", originalLabel: "9", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "0", originalLabel: "0", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "-", originalLabel: "-", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "=", originalLabel: "=", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "Backspace", originalLabel: "Backspace", class: "key-text", state: this.default_button_state, width: 2, isRemapped: false }
        ],
        // Row 3 - QWERTY
        [
            { label: "Tab", originalLabel: "Tab", class: "key-text", state: this.default_button_state, width: 1.5, isRemapped: false },
            { label: "Q", originalLabel: "Q", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "W", originalLabel: "W", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "E", originalLabel: "E", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "R", originalLabel: "R", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "T", originalLabel: "T", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "Y", originalLabel: "Y", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "U", originalLabel: "U", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "I", originalLabel: "I", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "O", originalLabel: "O", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "P", originalLabel: "P", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "[", originalLabel: "[", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "]", originalLabel: "]", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "\\", originalLabel: "\\", class: "key-text", state: this.default_button_state, width: 1.5, isRemapped: false }
        ],
        // Row 4 - ASDF
        [
            { label: "Caps", originalLabel: "Caps", class: "key-text", state: this.default_button_state, width: 1.75, isRemapped: false },
            { label: "A", originalLabel: "A", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "S", originalLabel: "S", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "D", originalLabel: "D", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "F", originalLabel: "F", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "G", originalLabel: "G", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "H", originalLabel: "H", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "J", originalLabel: "J", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "K", originalLabel: "K", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "L", originalLabel: "L", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: ";", originalLabel: ";", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "'", originalLabel: "'", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "Enter", originalLabel: "Enter", class: "key-text", state: this.default_button_state, width: 2.25, isRemapped: false }
        ],
        // Row 5 - ZXCV
        [
            { label: "Shift", originalLabel: "Shift", class: "key-text", state: this.default_button_state, width: 2.25, isRemapped: false },
            { label: "Z", originalLabel: "Z", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "X", originalLabel: "X", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "C", originalLabel: "C", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "V", originalLabel: "V", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "B", originalLabel: "B", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "N", originalLabel: "N", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "M", originalLabel: "M", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: ",", originalLabel: ",", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: ".", originalLabel: ".", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "/", originalLabel: "/", class: "key-text", state: this.default_button_state, width: 1, isRemapped: false },
            { label: "Shift", originalLabel: "Shift", class: "key-text", state: this.default_button_state, width: 2.75, isRemapped: false }
        ],
        // Row 6 - Bottom row
        [
            { label: "Ctrl", originalLabel: "Ctrl", class: "key-text", state: this.default_button_state, width: 1.25, isRemapped: false },
            { label: "Alt", originalLabel: "Alt", class: "key-text", state: this.default_button_state, width: 1.25, isRemapped: false },
            { label: "Space", originalLabel: "Space", class: "key-text", state: this.default_button_state, width: 6.25, isRemapped: false },
            { label: "Alt", originalLabel: "Alt", class: "key-text", state: this.default_button_state, width: 1.25, isRemapped: false },
            { label: "Ctrl", originalLabel: "Ctrl", class: "key-text", state: this.default_button_state, width: 1.25, isRemapped: false },
        ]
    ];

    get rgbColor(): string {
        return `rgb(${this.rgbRed}, ${this.rgbGreen}, ${this.rgbBlue})`;
    }

    get rgbOpacity(): number {
        return this.brightness / 100;
    }

    get rgbRed(): number { return this._rgbRed; }
    set rgbRed(value: number) {
        this._rgbRed = value;
        this.updateHexFromRgb();
    }

    get rgbGreen(): number { return this._rgbGreen; }
    set rgbGreen(value: number) {
        this._rgbGreen = value;
        this.updateHexFromRgb();
    }

    get rgbBlue(): number { return this._rgbBlue; }
    set rgbBlue(value: number) {
        this._rgbBlue = value;
        this.updateHexFromRgb();
    }

    get hexCodeInput(): string {return this._hexCodeInput; }
    set hexCodeInput(value: string)
    {
        this._hexCodeInput = value;
        this.updateRgbFromHex();
    }

    private updateHexFromRgb(): void {
        const r = this.rgbRed.toString(16).padStart(2, '0');
        const g = this.rgbGreen.toString(16).padStart(2, '0');
        const b = this.rgbBlue.toString(16).padStart(2, '0');
        // Update the backing field to prevent infinite loop from the setter
        this._hexCodeInput = `#${r}${g}${b}`.toUpperCase();
    }

    private updateRgbFromHex(): void {
        let hex = this._hexCodeInput.startsWith('#') ? this._hexCodeInput.slice(1) : this._hexCodeInput;

        // Ensure the hex code is a valid 6 characters
        if (hex.length === 6) {
            try {
                // Parse the hex string into separate R, G, B components
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);

                // Update the backing fields (not the setters) to avoid infinite loop
                this._rgbRed = r;
                this._rgbGreen = g;
                this._rgbBlue = b;
            } catch (e) {
                // Optionally log an error if parsing fails, but generally parseInt handles this gracefully by returning NaN
            }
        }
    }

    getRemappedKeys() {
        if (this.current_remap.length === 0) {
            // Only fetch if not already loaded
            invoke<string>("get_remap_json").then((event) => {
                if (typeof event === 'string') {
                    const parsedConfig: ConfigFileJson = JSON.parse(event);
                    this.fullConfig = parsedConfig;
                    this.current_remap = parsedConfig.configs;
                    console.log('Loaded config:', this.current_remap);
                    this.cdr.detectChanges();
                }
            }).catch(error => {
                console.error('Failed to load config:', error);
            });
        }
        return this.current_remap;
    }

    toggleTableView(): void {
        this.showTableView = !this.showTableView;
        if (this.showTableView) {
            this.getRemappedKeys();
        }
    }

    toggleRemapMode(): void {
        this.remapMode = !this.remapMode;
        this.getRemappedKeys();
        if (!this.remapMode) {
            this.selectedKeyIndex = null;
            this.remapInput = "";
        }
    }

    selectKey(rowIndex: number, colIndex: number): void {
        if (this.remapMode) {
            this.selectedKeyIndex = { row: rowIndex, col: colIndex };
            this.remapInput = this.keyboardLayout[rowIndex][colIndex].label;
        }
    }

    isKeySelected(rowIndex: number, colIndex: number): boolean {
        return this.selectedKeyIndex?.row === rowIndex && this.selectedKeyIndex?.col === colIndex;
    }

    applyRemap(): void {
        if (this.selectedKeyIndex && this.remapInput) {
            const key = this.keyboardLayout[this.selectedKeyIndex.row][this.selectedKeyIndex.col];
            key.label = this.remapInput;
            key.state = this.changed_button_state;
            key.isRemapped = true;
            this.remapInput = "";
            this.selectedKeyIndex = null;
        }
    }

    resetKey(): void {
        if (this.selectedKeyIndex) {
            const key = this.keyboardLayout[this.selectedKeyIndex.row][this.selectedKeyIndex.col];
            key.label = key.originalLabel;
            key.state = this.default_button_state;
            key.isRemapped = false;
            this.remapInput = "";
            this.selectedKeyIndex = null;
        }
    }

    resetAllKeys(): void {
        this.keyboardLayout.forEach(row => {
            row.forEach(key => {
                key.label = key.originalLabel;
                key.state = this.default_button_state;
                key.isRemapped = false;
            });
        });
        this.selectedKeyIndex = null;
        this.remapInput = "";
    }

    // Table editing methods
    startEditCell(rowIndex: number, field: string): void {
        this.editingCell = { rowIndex, field };
    }

    cancelEditCell(): void {
        this.editingCell = null;
    }

    isEditingCell(rowIndex: number, field: string): boolean {
        return this.editingCell?.rowIndex === rowIndex && this.editingCell?.field === field;
    }

    updateConfigField(rowIndex: number, field: string, value: string): void {
        if (rowIndex < this.current_remap.length) {
            if (field === 'remap_vivaldi_to_fn') {
                this.current_remap[rowIndex][field] = value === 'true';
            } else {
                (this.current_remap[rowIndex] as any)[field] = value;
            }
            this.editingCell = null;
            this.cdr.detectChanges();
        }
    }

    resetAllConfigs(): void {
        if (confirm('Reset all keys to default?')) {
            this.fullConfig = null;
            this.current_remap = [];
            this.getRemappedKeys();
            this.cdr.detectChanges();
        }
    }

    exportConfigJSON(): void {
        if (!this.fullConfig) {
            console.error('No config loaded');
            return;
        }

        const updatedConfig: ConfigFileJson = {
            ...this.fullConfig,
            remappings: this.current_remap.length,
            configs: this.current_remap
        };

        const jsonString = JSON.stringify(updatedConfig);
        
        console.log('Exporting config with', this.current_remap.length, 'entries');

        invoke<boolean>('set_remap', { params: jsonString })
    }

    getCellClass(value: any): any {
        if (value === 'NoDetect') return 'text-white';
        if (value === 'Enforce') return 'text-success fw-semibold';
        if (value === 'EnforceNot') return 'text-danger fw-semibold';
        return 'text-white fw-bold';
    }
}