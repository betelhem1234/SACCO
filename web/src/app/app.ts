import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { loadMembers } from './state/members.actions';
import { loadSavings } from './state/savings.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  private store = inject(Store);

  ngOnInit() {
    this.store.dispatch(loadMembers());
    this.store.dispatch(loadSavings());
  }
}
