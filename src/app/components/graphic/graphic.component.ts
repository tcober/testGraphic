import { Component, OnInit, AfterViewInit } from "@angular/core";
import * as d3 from "d3";
import * as _ from "lodash";
declare var require;

@Component({
  selector: "app-graphic",
  templateUrl: "./graphic.component.html",
  styleUrls: ["./graphic.component.scss"]
})
export class GraphicComponent implements OnInit, AfterViewInit {
  public graphic: any = require("./chart.json");
  public svg: any;
  public hierarchical = this.graphic.tasks[0];

  constructor() { }

  ngOnInit() {
    this.transformData();
    this.chart();
  }

  ngAfterViewInit() { }

  svgParse() {
    const parser = new DOMParser();
    this.svg = parser.parseFromString(this.svg, "text/xml");
  }

  transformData() {
    let self = this;
    self.graphic.tasks.forEach(function (task) {
      task.children = task.children || [];

      if (task.successors) {
        let successorIds = task.successors.split(',');
        successorIds.forEach(function (successorId) {
          let successor = self.graphic.tasks.find(function (successorTask) {
            return successorTask.task_number == +successorId;
          });

          task.children.push(successor);
        });
      }
    });

    this.graphic = this.graphic.tasks[0];
  }

  chart() {
    const width = 3000;
    const dx = 60;
    const dy = width / 8;
    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal = d3
      .linkHorizontal()
      .x(d => d.y)
      .y(d => {
        if (d.depth && (d.depth == 3 || d.depth == 5) {
          return 0;
        } else {
          return d.x;
        }
      });
    const margin = { top: 40, right: 10, bottom: 40, left: 200 };
    const root = d3.hierarchy(this.hierarchical);

    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
      if (d.depth && d.data.task_number.length !== 7) d.children = null;
    });

    const svg = d3
      .create("svg")
      .attr("width", width)
      .attr("height", dx)
      .attr("viewBox", [-margin.left, -margin.top, width, dx])
      .style("font", "14px sans-serif")
      .style("user-select", "none");

    // The line
    const gLink = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#02046d")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 2.5);

    const gNode = svg.append("g").attr("cursor", "pointer");

    function update(source) {
      const duration = d3.event && d3.event.altKey ? 2500 : 250;
      const nodes = root.descendants().reverse();
      const links = root.links();

      // Compute the new tree layout.
      tree(root);

      let left = root;
      let right = root;
      root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      const height = right.x - left.x + margin.top + margin.bottom;

      const transition = svg
        .transition()
        .duration(duration)
        .attr("height", height)
        .attr("viewBox", [-margin.left, left.x - margin.top, width, height]);

      // Update the nodes…
      const node = gNode.selectAll("g").data(nodes, d => d.id);

      // Enter any new nodes at the parent's previous position.

      const nodeEnter = node
        .enter()
        .append("g")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", d => {
          d.children = d.children ? null : d._children;
          update(d);
        });

      nodeEnter
        .append('foreignObject')
        .attr("y", "-25px")
        .attr("x", d => (d._children ? -100 : 15))
        .attr("width", "400px")
        .attr("height", "30px")
        .append('xhtml:div')
        .attr("class", "bubble")
        .attr("position", "absolute")
        .attr("style",
          "height: auto; width: auto; display: inline-block;background: #fff; border: 2px solid lightgrey; border-radius: 10px; padding: 10px;"
        ).text(d => d.data.task)


      // Transition nodes to their new position.
      const nodeUpdate = node
        .merge(nodeEnter)
        .transition(transition)
        .attr("transform", d => {
          if (d.data.id == 243709 || d.data.id == 243727) {
            return `translate(${d.y}, 0)`
          } else {
            return `translate(${d.y},${d.x})`;
          }
        })
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

      // Transition exiting nodes to the parent's new position.
      const nodeExit = node
        .exit()
        .transition(transition)
        .remove()
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

      // Update the links…
      const link = gLink.selectAll("path").data(links, d => { return d.target.id });

      // Enter any new links at the parent's previous position.
      const linkEnter = link
        .enter()
        .append("path")
        .attr("d", d => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        });

      // Transition links to their new position.
      link
        .merge(linkEnter)
        .transition(transition)
        .attr("d", diagonal);

      // Transition exiting nodes to the parent's new position.
      link
        .exit()
        .transition(transition)
        .remove()
        .attr("d", d => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        });

      // Stash the old positions for transition.
      root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    update(root);
    const container = document.querySelector(".container");
    this.svg = svg.node();
    container.appendChild(this.svg);
  }
}
