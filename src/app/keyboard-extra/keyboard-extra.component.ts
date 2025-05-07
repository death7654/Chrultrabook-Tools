import { Component } from "@angular/core";

@Component({
    selector: "app-keyboard-extra",
    imports: [],
    templateUrl: "./keyboard-extra.component.html",
    styleUrl: "./keyboard-extra.component.scss"
})
export class KeyboardExtraComponent {
    default_active_class: string = "mx-1 p-0 svg";
    exception_active_class: string = "fs-6 mx-1";
    text_active_class: string = "mx-1 p-0"
    default_button_state: string = "btn-outline-secondary";
    changed_button_state: string = "btn-outline-warning";
    key1: string = "esc";
    key2: string = "\uf12f";
    key3: string = "\uF138";
    key4: string = "\uF116";
    key5: string = "\uF3DF";
    key6: string = "\uF6D2";
    key7: string = "\uF3E5";
    key8: string = "\uF3E5";
    key9: string = "\uF60D";
    key10: string = "\uF60B";
    key11: string = "\uF611";
    key12: string = "\uF47B";

    function_keys = [
        {
            label: this.key1,
            class: this.text_active_class,
            state: this.default_button_state
        },
        {
            label: this.key2,
            class: this.default_active_class,
            state: this.default_button_state
        },
        {
            label: this.key3,
            class: this.default_active_class,
            state: this.default_button_state
        },
        {
            label: this.key4,
            class: this.default_active_class,
            state: this.default_button_state
        },
        {
            label: this.key5,
            class: this.default_active_class,
            state: this.default_button_state
        },
        {
            label: this.key6,
            class: this.default_active_class,
            state: this.default_button_state
        },
        {
            label: this.key7,
            class: this.exception_active_class,
            state: this.default_button_state
        },
        {
            label: this.key8,
            class: this.default_active_class,
            state: this.default_button_state
        },
        {
            label: this.key9,
            class: this.default_active_class,
            state: this.default_button_state
        },
        {
            label: this.key10,
            class: this.default_active_class,
            state: this.default_button_state
        },
        {
            label: this.key11,
            class: this.default_active_class,
            state: this.default_button_state
        },
        {
            label: this.key12,
            class: this.default_active_class,
            state: this.default_button_state
        },
    ]

    change(i: number)
    {
        if (this.function_keys[i].state == this.default_button_state)
        {
            this.function_keys[i].state = this.changed_button_state
        }
        else
        {
            this.function_keys[i].state = this.default_button_state
        }
        switch(i){
            case 0:{
                if(this.function_keys[i].label == this.key1)
                {
                    this.function_keys[i].label = "F1"
                    this.function_keys[i].class = this.text_active_class
                }
                else
                {
                    this.function_keys[i].label = this.key1;
                    this.function_keys[i].class = this.default_active_class
                }
                break;
            }
            case 1: {
                if(this.function_keys[i].label == this.key2)
                    {
                        this.function_keys[i].label = "F2"
                        this.function_keys[i].class = this.text_active_class
                    }
                    else
                    {
                        this.function_keys[i].label = this.key2;
                        this.function_keys[i].class = this.default_active_class
                    }
                    break;
            }
            case 2: {
                if(this.function_keys[i].label == this.key3)
                    {
                        this.function_keys[i].label = "F3"
                        this.function_keys[i].class = this.text_active_class
                    }
                    else
                    {
                        this.function_keys[i].label = this.key1;
                        this.function_keys[i].class = this.default_active_class
                    }
                    break;
            }


        }


    }
}
