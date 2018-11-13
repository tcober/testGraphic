import { Component, OnInit } from "@angular/core";
import { D3FiddlinService } from "./d3-fiddlin.service";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
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
  public sidebar = false;

  constructor(private d3FiddlinService: D3FiddlinService) { }

  ngOnInit() {
    let self = this;
    this.tasks.forEach(function (task) {
      task.numAncestors = self.d3FiddlinService.setNumberOfAncestors(self.tasks, task, 0);
      task.numSiblings = self.d3FiddlinService.setNumberOfSiblings(self.tasks, task);
    });

    this.createChart();
  }

  createChart() {
    var nodeSetup = {
      height: 56,
      width: 200,
      padding: 5,
      verticalSpacing: 20,
      horizontalSpacing: 200
    };

    var numOfAncestors = this.d3FiddlinService.getTotalAncestorLevels(this.tasks);
    var maxSiblingSize = this.d3FiddlinService.getMaxSiblingSize(this.tasks);

    var svgSetup = {
      height: maxSiblingSize * nodeSetup.height + (maxSiblingSize - 1) * nodeSetup.verticalSpacing,
      width: numOfAncestors * nodeSetup.width + (numOfAncestors - 1) * nodeSetup.horizontalSpacing
    };

    // 1. Create SVG
    var svg = d3
      .select(".svg-container")
      .append("svg")
      .attr("width", svgSetup.width)
      .attr("height", svgSetup.height)
      .attr("class", "svg-root");

    // 2. Create Zoom Container
    var zoomContainer = svg.append("g").attr("class", "zoom-container");
    var zoom = d3
      .zoom()
      .scaleExtent([0.5, 40])
      .translateExtent([[-100, -100], [svgSetup.width + 90, svgSetup.height + 100]])
      .on("zoom", function () {
        zoomContainer.attr("transform", d3.event.transform);
      });
    svg.call(zoom);

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
      .attr("data-task-number", function (d) {
        return d["task_number"];
      })
      .attr("transform", function (d, i) {
        if (d["task_number"] == 25074 || d["task_number"] == 25109 || d["task_number"] == 25127) {
          d.numSiblings = 8;
        }

        return (
          "translate(" +
          d.numAncestors * (nodeSetup.width + nodeSetup.horizontalSpacing) +
          "," +
          d.numSiblings * (nodeSetup.height + nodeSetup.verticalSpacing) +
          ")"
        );
      });

    bar
      .append('foreignObject')
      .attr("width", "200px")
      .attr("height", "30px")
      .append('xhtml:div')
      .attr("class", "bubble")
      .html((d) => {
        return `
            <div class="sidebar-trig"><span class="elipsis">&hellip;</span></div>
            <div class="text-contain">
              <img class="icon" src="../../assets/server.png"/>
              <p class="bubble-text">${d.task}</p>
            </div>
            `;
      })

    // 11. Create the links between nodes
    this.tasks.forEach(task => {
      var startNode = d3.select(`g[data-task-number="${task["task_number"]}"]`).node();
      var src = {
        x: startNode.getCTM().e,
        y: startNode.getCTM().f
      };

      if (task.successors) {
        var childrenTaskNumbers = task.successors.split(",");
        childrenTaskNumbers.forEach(childTaskNumber => {
          var endNode = d3.select(`g[data-task-number="${childTaskNumber}"]`).node();
          var dest = {
            x: endNode.getCTM().e,
            y: endNode.getCTM().f
          };

          var lineGenerator = d3.line().curve(d3.curveBasis);

          var points = [];
          if (childrenTaskNumbers.length > 1) {
            // more than one child (curves arrow differently)
            points = [
              [src.x + nodeSetup.width * 0.75, src.y + nodeSetup.height / 2],
              [src.x + nodeSetup.width * 0.75, dest.y + nodeSetup.height / 2],
              [dest.x - 1, dest.y + nodeSetup.height / 2]
            ];
          } else {
            if (src.y > dest.y) {
              //src is higher than dest
              points = [
                [src.x + nodeSetup.width - 5, src.y + nodeSetup.height / 2],
                [dest.x + nodeSetup.width * 0.25, src.y + nodeSetup.height / 2],
                [dest.x + nodeSetup.width * 0.25, dest.y + nodeSetup.height]
              ];
            } else if (src.y == dest.y) {
              //src is same level as dest
              points = [
                [src.x + nodeSetup.width - 5, src.y + nodeSetup.height / 2],
                [dest.x, dest.y + nodeSetup.height / 2]
              ];
            } else {
              //src is lower than dest
              points = [
                [src.x + nodeSetup.width - 5, src.y + nodeSetup.height / 2],
                [dest.x + nodeSetup.width * 0.25, src.y + nodeSetup.height / 2],
                [dest.x + nodeSetup.width * 0.25, dest.y]
              ];
            }
          }

          var pathData = lineGenerator(points);

          links
            .append("path")
            .attr("class", "link")
            .attr("marker-end", () => "url(#arrow)")
            .attr("d", pathData);
        });
      }
    });

    const sidebarTrig = document.querySelectorAll(".sidebar-trig");
    sidebarTrig.forEach(element => {
      element.addEventListener("click", event => {
        event.stopPropagation();
        event.preventDefault();
        this.sidebar = !this.sidebar;
      });
    });
  }
}
