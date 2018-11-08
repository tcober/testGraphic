export class DataTransformService {

  convertToForceData(tasks) {
    let data = {
      nodes: [],
      links: []
    };

    tasks.forEach((task) => {
      data.nodes.push(task);

      if (task.successors) {
        const ids = task.successors.split(',');
        ids.forEach((id) => {
          data.links.push({
            source: task.task_number,
            target: id
          });
        });
      }
    });

    return data;
  }

  transformData(tasks) {
    tasks.forEach(function (task) {
      task.children = task.children || [];

      if (task.successors) {
        let successorIds = task.successors.split(',');
        successorIds.forEach(function (successorId) {
          let successor = tasks.find(function (successorTask) {
            return successorTask.task_number == +successorId;
          });

          task.children.push(successor);
        });
      }
    });

    return tasks[0];
  }

}
