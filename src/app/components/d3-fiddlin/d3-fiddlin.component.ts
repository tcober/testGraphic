import { Component, OnInit } from "@angular/core";
import { D3FiddlinService } from "./d3-fiddlin.service";
import * as d3 from "d3";
import * as _ from "lodash";
declare var require;

@Component({
  selector: "app-d3-fiddlin",
  templateUrl: "./d3-fiddlin.component.html",
  styleUrls: ["./d3-fiddlin.component.scss"]
})
export class D3FiddlinComponent implements OnInit {
  private apiData: any = require("../graphic/chart.json");
  private tasks: any[] = this.apiData.tasks;

  constructor(private d3FiddlinService: D3FiddlinService) {}

  ngOnInit() {
    let self = this;
    this.tasks.forEach(function(task) {
      task.numAncestors = self.d3FiddlinService.numberOfAncestors(
        self.tasks,
        task,
        0
      );
      task.numSiblings = self.d3FiddlinService.numberOfSiblings(
        self.tasks,
        task
      );
    });

    this.createChart();
  }

  createChart() {
    var svgWidth = 1000;
    var svgHeight = 600;

    // 1. Create SVG
    var svg = d3
      .select(".svg-container")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .attr("class", "svg-root");

    // 2. Create Zoom Container
    var zoomContainer = svg.append("g").attr("class", "zoom-container");
    var zoom = d3
      .zoom()
      .scaleExtent([1, 40])
      .translateExtent([[-100, -100], [svgWidth + 90, svgHeight + 100]])
      .on("zoom", function() {
        zoomContainer.attr("transform", d3.event.transform);
      });
    svg.call(zoom);

    // 3. Setup Sizing
    var barPadding = 5;
    var xBarSpacing = 40;
    var barWidth = (svgWidth - xBarSpacing * (6 - 1)) / 6;
    var barHeight = 30;
    var maxSiblingSize = this.d3FiddlinService.getMaxSiblingSize(this.tasks);

    // 4. Create Groups (which act as containers)
    var defs = zoomContainer.append("defs").attr("id", "defs");
    var links = zoomContainer.append("g").attr("id", "links");
    var nodes = zoomContainer.append("g").attr("id", "nodes");

    // 5. In <defs>, create the tip of the arrow
    defs
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("class", "arrowHead");

    // 6. Create group which holds the task node
    var bar = nodes
      .selectAll("g")
      .data(this.tasks)
      .enter()
      .append("g")
      .attr("data-task-number", function(d) {
        return d["task_number"];
      })
      .attr("transform", function(d, i) {
        if (
          d["task_number"] == 25074 ||
          d["task_number"] == 25109 ||
          d["task_number"] == 25127
        ) {
          d.numSiblings = 8;
        }

        return (
          "translate(" +
          d.numAncestors * (barWidth + xBarSpacing) +
          "," +
          d.numSiblings * (barHeight + 5) +
          ")"
        );
      });

    // 7. Create task node
    var rect2 = bar
      .append("rect")
      .attr("width", 40)
      .attr("fill", "#4286f4")
      .attr("height", barHeight);

    // 8. Create task icon container
    var rect1 = bar
      .append("rect")
      .attr("class", "node")
      .attr("width", barWidth - barPadding)
      .attr("fill", "none")
      .attr("fill-opacity", 0)
      .attr("height", barHeight);

    // 9. Add symbol task node
    var symbolContainerWidth = 15;

    var symbolContainer = bar
      .append("text")
      .attr("x", 5)
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .attr("width", barWidth - barPadding)
      .attr("font-family", "Font Awesome 5 Free")
      .attr("class", "task-icon")
      // .attr('font-size', function(d) { return d.size + 'em' })
      .text(function(d) {
        return "\uf2cd";
      });

    // 10. Add text to task node
    var textContainer = bar
      .append("text")
      .attr("x", symbolContainerWidth + 5)
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .attr("width", barWidth - symbolContainerWidth)
      .text(function(d) {
        return d["task_number"];
      });

    // 11. Create the links between nodes
    this.tasks.forEach(task => {
      var startNode = d3
        .select(`g[data-task-number="${task["task_number"]}"]`)
        .node();
      var src = {
        x: startNode.getCTM().e,
        y: startNode.getCTM().f
      };

      if (task.successors) {
        var childrenTaskNumbers = task.successors.split(",");
        childrenTaskNumbers.forEach(childTaskNumber => {
          var endNode = d3
            .select(`g[data-task-number="${childTaskNumber}"]`)
            .node();
          var dest = {
            x: endNode.getCTM().e,
            y: endNode.getCTM().f
          };

          var lineGenerator = d3.line().curve(d3.curveBasis);

          var points = [];
          if (childrenTaskNumbers.length > 1) {
            // more than one child (curves arrow differently)
            points = [
              [src.x + barWidth * 0.75, src.y + barHeight / 2],
              [src.x + barWidth * 0.75, dest.y + barHeight / 2],
              [dest.x - 1, dest.y + barHeight / 2]
            ];
          } else {
            if (src.y > dest.y) {
              //src is higher than dest
              points = [
                [src.x + barWidth - 5, src.y + barHeight / 2],
                [dest.x + barWidth * 0.25, src.y + barHeight / 2],
                [dest.x + barWidth * 0.25, dest.y + barHeight]
              ];
            } else if (src.y == dest.y) {
              //src is same level as dest
              points = [
                [src.x + barWidth - 5, src.y + barHeight / 2],
                [dest.x, dest.y + barHeight / 2]
              ];
            } else {
              //src is lower than dest
              points = [
                [src.x + barWidth - 5, src.y + barHeight / 2],
                [dest.x + barWidth * 0.25, src.y + barHeight / 2],
                [dest.x + barWidth * 0.25, dest.y]
              ];
            }
          }

          var pathData = lineGenerator(points);

          links
            .append("path")
            .attr("class", "link")
            .attr("marker-end", d => "url(#arrow)")
            .attr("d", pathData);
        });
      }
    });
  }
}
