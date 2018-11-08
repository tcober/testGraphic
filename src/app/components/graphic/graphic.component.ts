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
    this.dataTransform(this.hierarchical);
    this.makingChildren(this.hierarchical)
    this.chart();
  }

  ngAfterViewInit() { }

  svgParse() {
    const parser = new DOMParser();
    this.svg = parser.parseFromString(this.svg, "text/xml");
  }

  elipsisAdd() {
    const svg = d3.select("svg");
    svg
      .selectAll("a")
      .append("text")
      .attr("class", "elipsis")
      .text(() => {
        return "...";
      });
  }

  //go through the first element
  //add a children field
  dataTransform(element: any) {
    if (element.children) {
      this.makingChildren(element);
      return
    }
    element.successors = element.successors.split(",");
    element.successors.forEach(i => {
      if (!element.children) {
        element.children = []
      }
      let foundOne = _.find(this.graphic.tasks, { "task_number": parseInt(i) });
      element.children.push(foundOne);
    });
  }

  makingChildren(element: any) {
    if (element.children.length) {
      element.children.forEach(j => {
        j.successors = j.successors.split(",");
        j.successors.forEach(k => {
          if (!j.children) {
            j.children = [];
          }
          let foundOne = _.find(this.graphic.tasks, { "task_number": parseInt(k) });
          j.children.push(foundOne);
        });
        if (j.children.length) {
          j.children.forEach(l => {
            this.dataTransform(l);
          })
        }
      })
    }
  }

  chart() {
    const width = 2000;
    const dx = 60;
    const dy = width / 4;
    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal = d3
      .linkHorizontal()
      .x(d => d.y)
      .y(d => {
        if (d.depth && d.depth == 3) {
          return 0;
        } else {
          return d.x;
        }
      });
    const margin = { top: 10, right: 10, bottom: 10, left: 200 };
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

      // nodeEnter
      //   .append("foreignobject")
      //   .attr("width", "230px")
      //   .attr("height", "50px")
      //   .attr("fill", "white")
      //   .attr("stroke-width", "3px")
      //   .attr("stroke", "#000")
      //   .append("div")
      //   .append("p")
      //   .attr("innerHTML", `d.data.task`)
      //   .clone(true)
      //   .lower()
      //   .attr("stroke-linejoin", "round")
      //   .attr("stroke-width", 8)
      //   .attr("stroke", "white");

      nodeEnter
        .append("circle")
        .attr("r", 5.5)
        .attr("fill", d => (d._children ? "#e6d32a" : "#999"));

      nodeEnter
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", d => (d._children ? -20 : 15))
        .attr("text-anchor", d => (d._children ? "end" : "start"))
        .text(d => d.data.task)
        .clone(true)
        .lower()
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 8)
        .attr("stroke", "white");

      // Transition nodes to their new position.
      const nodeUpdate = node
        .merge(nodeEnter)
        .transition(transition)
        .attr("transform", d => {
          if (d.data.id == 243709) {
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
