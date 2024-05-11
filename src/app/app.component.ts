import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { invoke } from "@tauri-apps/api/tauri";
import { FanSectionComponent } from './home/fan-section/fan-section.component';
import { KeyboardSectionComponent } from './home/keyboard-section/keyboard-section.component';
import { ActivityLightSectionComponent } from './home/activity-light-section/activity-light-section.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FanSectionComponent, KeyboardSectionComponent,ActivityLightSectionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
