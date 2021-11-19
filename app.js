
// Learn OWL by Erlangga
// This code is intended to be my cheat sheet in OWL.
/*The Odoo Web Library (OWL) is a smallish (~<20kb gzipped) UI framework intended to be the basis for the Odoo Web Client. Owl is a modern framework, written in Typescript, taking the best ideas from React and Vue in a simple and consistent way. Owl's main features are:

a declarative component system,
a reactivity system based on hooks,
concurrent mode by default,
a store and a frontend router
Owl components are defined with ES6 classes, they use QWeb templates, an underlying virtual DOM, integrates beautifully with hooks, and the rendering is asynchronous.*/

const { Component, mount } = owl;
const { xml } = owl.tags;
const { whenReady } = owl.utils;
const { useRef, useState } = owl.hooks;

/**
 * This is the javascript code defined in the playground.
 * In a larger application, this code should probably be moved in different
 * sub files.
 */

const TASK_TEMPLATE = xml`
    <div class="task" t-att-class="props.task.isCompleted? 'done' : ''" >
        <input type="checkbox" t-att-checked="props.task.isCompleted" t-on-click="toggleTask" />
        <span t-on-click="toggleTask" ><t t-esc="props.task.title"/></span>
        <span class="delete" t-on-click="deleteTask">🗑</span>
    </div>`

class Task extends Component {
  static template = TASK_TEMPLATE;
  static props = ["task"];

  toggleTask(){
    this.trigger('toggle-task', {id: this.props.task.id})
  }

  deleteTask() {
    this.trigger('delete-task', {id: this.props.task.id});
  }
}

const APP_TEMPLATE = xml`
    <div class="todo-app">
        <input placeholder="Enter a new task" t-on-keyup="addTask" t-ref="add-input"/>
        <div class="task-list" t-on-toggle-task="toggleTask" t-on-delete-task="deleteTask">
            <t t-foreach="tasks" t-as="task" t-key="task.id">
                <Task task="task"/>
            </t>
        </div>
    </div>`

class App extends Component {
  static template = APP_TEMPLATE;
  static components = {Task};

  inputRef = useRef("add-input");

  addTask(ev) {
      // 13 is keycode for ENTER
      if (ev.keyCode === 13) {
          const title = ev.target.value.trim();
          ev.target.value = "";
          if (title){
            const newTask = {id: this.nextId++, 
                             title: title,
                             isCompleted: false};
            this.tasks.push(newTask);
          }
          // todo
      }
  }

  toggleTask(ev) {
    const task = this.tasks.find(t => t.id === ev.detail.id);
    task.isCompleted = !task.isCompleted;
  }

  deleteTask(ev){
    const index = this.tasks.findIndex(t => t.id === ev.detail.id);
    this.tasks.splice(index, 1);
  }

  mounted() {
      this.inputRef.el.focus();
  }

  nextId = 1;
  tasks = useState([]);
}

// Setup code
function setup() {
  owl.config.mode = "dev";
  mount(App, { target: document.body });
}

whenReady(setup);

(function () {
  console.log("hello owl", owl.__info__.version);
})();