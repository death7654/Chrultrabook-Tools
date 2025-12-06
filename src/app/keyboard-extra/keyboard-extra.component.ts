import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { invoke } from "@tauri-apps/api/core";
import { ChangeDetectorRef } from '@angular/core';


interface Key {
    label: string;
    state: string;
    width?: number;
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
        this.getRemappedKeys(false);
    }

    keyboardLayout: Key[][] = [
    // Row 1 - Function keys
    [
        { label: "esc", state: this.default_button_state, width: 1 },
        { label: "\uF12F", state: this.default_button_state, width: 1 },
        { label: "\uF138", state: this.default_button_state, width: 1 },
        { label: "\uF116", state: this.default_button_state, width: 1 },
        { label: "\uF14D", state: this.default_button_state, width: 1 },
        { label: "\uF6CF", state: this.default_button_state, width: 1 },
        { label: "\uF1D4", state: this.default_button_state, width: 1 },
        { label: "\uF1D2", state: this.default_button_state, width: 1 },
        { label: "\uF60D", state: this.default_button_state, width: 1 },
        { label: "\uF60B", state: this.default_button_state, width: 1 },
        { label: "\uF611", state: this.default_button_state, width: 1 },
        { label: "\uF47B", state: this.default_button_state, width: 1 },
    ],
    // Row 2 - Number row
    [
        { label: "`", state: this.default_button_state, width: 1 },
        { label: "1", state: this.default_button_state, width: 1 },
        { label: "2", state: this.default_button_state, width: 1 },
        { label: "3", state: this.default_button_state, width: 1 },
        { label: "4", state: this.default_button_state, width: 1 },
        { label: "5", state: this.default_button_state, width: 1 },
        { label: "6", state: this.default_button_state, width: 1 },
        { label: "7", state: this.default_button_state, width: 1 },
        { label: "8", state: this.default_button_state, width: 1 },
        { label: "9", state: this.default_button_state, width: 1 },
        { label: "0", state: this.default_button_state, width: 1 },
        { label: "-", state: this.default_button_state, width: 1 },
        { label: "=", state: this.default_button_state, width: 1 },
        { label: "backspace", state: this.default_button_state, width: 2 }
    ],
    // Row 3 - QWERTY
    [
        { label: "tab", state: this.default_button_state, width: 1.5 },
        { label: "Q", state: this.default_button_state, width: 1 },
        { label: "W", state: this.default_button_state, width: 1 },
        { label: "E", state: this.default_button_state, width: 1 },
        { label: "R", state: this.default_button_state, width: 1 },
        { label: "T", state: this.default_button_state, width: 1 },
        { label: "Y", state: this.default_button_state, width: 1 },
        { label: "U", state: this.default_button_state, width: 1 },
        { label: "I", state: this.default_button_state, width: 1 },
        { label: "O", state: this.default_button_state, width: 1 },
        { label: "P", state: this.default_button_state, width: 1 },
        { label: "[", state: this.default_button_state, width: 1 },
        { label: "]", state: this.default_button_state, width: 1 },
        { label: "\\", state: this.default_button_state, width: 1.5 }
    ],
    // Row 4 - ASDF
    [
        { label: "\uF52A", state: this.default_button_state, width: 1.75 },
        { label: "A", state: this.default_button_state, width: 1 },
        { label: "S", state: this.default_button_state, width: 1 },
        { label: "D", state: this.default_button_state, width: 1 },
        { label: "F", state: this.default_button_state, width: 1 },
        { label: "G", state: this.default_button_state, width: 1 },
        { label: "H", state: this.default_button_state, width: 1 },
        { label: "J", state: this.default_button_state, width: 1 },
        { label: "K", state: this.default_button_state, width: 1 },
        { label: "L", state: this.default_button_state, width: 1 },
        { label: ";", state: this.default_button_state, width: 1 },
        { label: "'", state: this.default_button_state, width: 1 },
        { label: "Enter", state: this.default_button_state, width: 2.25 }
    ],
    // Row 5 - ZXCV
    [
        { label: "Shift", state: this.default_button_state, width: 2.25 },
        { label: "Z", state: this.default_button_state, width: 1 },
        { label: "X", state: this.default_button_state, width: 1 },
        { label: "C", state: this.default_button_state, width: 1 },
        { label: "V", state: this.default_button_state, width: 1 },
        { label: "B", state: this.default_button_state, width: 1 },
        { label: "N", state: this.default_button_state, width: 1 },
        { label: "M", state: this.default_button_state, width: 1 },
        { label: ",", state: this.default_button_state, width: 1 },
        { label: ".", state: this.default_button_state, width: 1 },
        { label: "/", state: this.default_button_state, width: 1 },
        { label: "Shift", state: this.default_button_state, width: 2.75 }
    ],
    // Row 6 - Bottom row
    [
        { label: "Ctrl", state: this.default_button_state, width: 1.25 },
        { label: "Alt", state: this.default_button_state, width: 1.25 },
        { label: "Space", state: this.default_button_state, width: 6.25 },
        { label: "Alt", state: this.default_button_state, width: 1.25 },
        { label: "Ctrl", state: this.default_button_state, width: 1.25 },
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

    getRemappedKeys(type: boolean) {
        if (this.current_remap.length === 0) {
            // Only fetch if not already loaded
            invoke<string>("get_remap_json", {hardReset: type}).then((event) => {
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
            this.remapInput = "";
            this.selectedKeyIndex = null;
        }
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

    resetToCurrentConfig(): void {
        if (confirm('Reset all keys to previous save state?')) {
            this.fullConfig = null;
            this.current_remap = [];
            this.getRemappedKeys(false);
            this.cdr.detectChanges();
        }
    }

    resetToOriginalConfig(): void {
        if (confirm('Reset all keys to original remap state?')) {
            this.fullConfig = null;
            this.current_remap = [];
            this.getRemappedKeys(true);
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