import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";
declare var require;

@Component({
  selector: "app-graphic",
  templateUrl: "./graphic.component.html",
  styleUrls: ["./graphic.component.scss"]
})
export class GraphicComponent implements OnInit {
  public graphic: any = require("./chart.json");
  public svg: any;

  constructor() {}

  ngOnInit() {
    this.svgParse();
  }

  svgParse() {
    const parser = new DOMParser();
    this.svg = parser.parseFromString(this.graphic.svgText, "text/xml");
    console.log(this.svg);
  }
}
