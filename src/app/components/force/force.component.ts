import { Component, OnInit } from '@angular/core';
import * as d3 from "d3";
import * as _ from "lodash";
import {DataTransformService} from '../../services/data-transform.service';

declare var require;

@Component({
  selector: 'app-force',
  templateUrl: './force.component.html',
  styleUrls: ['./force.component.scss']
})
export class ForceComponent implements OnInit {
  public apiData: any = require("src/app/components/graphic/chart.json");
  private taskData: any = this.apiData.tasks;
  private data: any;

  constructor(private dataTransformService: DataTransformService) { }

  ngOnInit() {
    this.data = this.dataTransformService.transformData(this.taskData);
    console.log(this.data);
    this.createChart();
  }

  createChart() {
    var width = 965,
      height = 500,
      radius = 6;

    var fill = d3.scaleOrdinal(d3.schemeCategory20);

    var svg = d3.select(".thesvg").append("svg")
      .attr("width", width)
      .attr("height", height);

    var link = svg.selectAll("line")
      .data(this.data.links)
      .enter().append("line");

    var node = svg.selectAll("circle")
      .data(this.data.nodes)
      .enter().append("circle")
      .attr("r", radius - .75)
      .style("fill", function(d) { return fill(d.group); })
      .style("stroke", function(d) { return d3.rgb(fill(d.group)).darker(); })
      // .call(force.drag);
  }

}
