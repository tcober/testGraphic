export class D3FiddlinService {
  setNumberOfAncestors(tasks: any[], task: any, ancestorCount: any) {
    var parent = tasks.find(function(t) {
      return (
        t.successors && t.successors.includes(task["task_number"].toString())
      );
    });
    return parent
      ? this.setNumberOfAncestors(tasks, parent, ancestorCount + 1)
      : ancestorCount;
  }

  setNumberOfSiblings(tasks: any[], task: any) {
    var siblings = tasks.filter(function(t) {
      return (
        t.numAncestors !== undefined &&
        task.numAncestors !== undefined &&
        t.numAncestors == task.numAncestors
      );
    });

    return siblings.length - 1;
  }

  getTotalAncestorLevels(tasks: any[]) {
    var numOfAncestors = tasks.map(task => {
      return task.numAncestors;
    });

    return Math.max(...numOfAncestors) + 1;
  }

  getMaxSiblingSize(tasks: any[]) {
    var arr = tasks.map(task => {
      return task.numSiblings;
    });
    return Math.max.apply(null, arr) + 1;
  }

  getSiblingsCount(numberOfAncestors, tasks) {
    return tasks.filter(t => {
      return numberOfAncestors == t.numAncestors;
    }).length;
  }
}
