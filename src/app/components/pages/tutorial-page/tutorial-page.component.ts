import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutorial-page',
  templateUrl: './tutorial-page.component.html',
  styleUrls: ['./tutorial-page.component.scss'],
  host: {
    class: 'view'
  }
})
export class TutorialPageComponent implements OnInit {

  pages = [
    {
      title: "Welcome to Overhold Tutorial",
      body: "Starbucks with the your account already logged in which is really stupid",
      footer: "Let's go to the next step.",
      imgUrl: "src/img/tutorial_image_screen.png"
    },
    {
      title: "Lorem ipsum",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      footer: "Ut enim ad minim veniam.",
      imgUrl: "src/img/tutorial_image_screen.png"
    },
    {
      title: "Lorem ipsum dolor",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      footer: "Ut enim ad minim.",
      imgUrl: "src/img/tutorial_image_screen.png"
    },
    {
      title: "Lorem ipsum dolor sit amet",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
      footer: "Ut enim .",
      imgUrl: "src/img/tutorial_image_screen.png"
    },
    {
      title: "Lorem ipsum",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      footer: "Ut enim ad minim veniam.",
      imgUrl: "src/img/tutorial_image_screen.png"
    },
    {
      title: "Lorem",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, tempor incididunt ut labore et dolore magna aliqua.",
      footer: "Ut enim ad veniam.",
      imgUrl: "src/img/tutorial_image_screen.png"
    },
    {
      title: "Lorem ipsum",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      footer: "Ut enim ad minim veniam.",
      imgUrl: "src/img/tutorial_image_screen.png"
    }
  ];
  currentPage: number = 1;

  constructor(
    private location: Location,
    private router: Router
  ) { }

  ngOnInit() {
  }

  backClicked() {
    this.location.back();
  }

  clickSkip() {
    this.router.navigate(['/signup']);
  };

  onPaging(page) {
    this.currentPage = page;
  }

  nextPage() {
    if(this.currentPage < this.pages.length)
      this.currentPage++;
  }

  prevPage() {
    if(this.currentPage > 1)
    this.currentPage--;
  }

}
