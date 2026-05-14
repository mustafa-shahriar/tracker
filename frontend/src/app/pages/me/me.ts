import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-me',
  imports: [Navbar],
  templateUrl: './me.html',
  styleUrl: './me.css',
})
export class Me {}
