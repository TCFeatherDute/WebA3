import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';

/**
 * Root component.
 *
 * Assembles the common page segments once — Header, Nav, Body
 * (router outlet) and Footer — so they are shared identically across
 * every admin page instead of being duplicated per view.
 */
@Component({
  imports: [RouterOutlet, Header, Navbar, Footer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
