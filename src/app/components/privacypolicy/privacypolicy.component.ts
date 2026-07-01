import { Component, OnInit } from '@angular/core';
import { SeoMetaService } from 'app/services/seo-meta.service';

@Component({
  selector: 'app-privacypolicy',
  imports: [],
  templateUrl: './privacypolicy.component.html',
  styleUrl: './privacypolicy.component.css',
})
export class PrivacypolicyComponent implements OnInit {
  constructor(private readonly seo: SeoMetaService) {}

  ngOnInit(): void {
    this.seo.applyPrivacyPolicy();
  }
}
