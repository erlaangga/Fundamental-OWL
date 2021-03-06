
// Learn OWL by Erlangga
// This code is intended to be my cheat sheet in OWL.
/*The Odoo Web Library (OWL) is a smallish (~<20kb gzipped) UI framework intended to be the basis for the Odoo Web Client. Owl is a modern framework, written in Typescript, taking the best ideas from React and Vue in a simple and consistent way. Owl's main features are:

a declarative component system,
a reactivity system based on hooks,
concurrent mode by default,
a store and a frontend router
Owl components are defined with ES6 classes, they use QWeb templates, an underlying virtual DOM, integrates beautifully with hooks, and the rendering is asynchronous.*/

const { Component, mount, Store } = owl;
const { xml } = owl.tags;
const { whenReady } = owl.utils;
const { useRef, useState, useDispatch, useStore } = owl.hooks;

/**
 * This is the javascript code defined in the playground.
 * In a larger application, this code should probably be moved in different
 * sub files.
 */

const actions = {
  addTask({state}, title) {
    title = title.trim();
    if (title){
      const newTask = {id: state.nextId++, 
                       title: title,
                       isCompleted: false};
      state.tasks.push(newTask);
    }
  },
  toggleTask({state}, id) {
    const task = state.tasks.find(t => t.id === id);
    task.isCompleted = !task.isCompleted;
  },
  deleteTask({state}, id) {
    const index = state.tasks.findIndex(t => t.id === id);
    state.tasks.splice(index, 1);
  }
};

const initialState = {
  nextId: 1,
  tasks: [],
};

const TASK_TEMPLATE = xml`
    <div class="task" t-att-class="props.task.isCompleted? 'done' : ''" >
        <input type="checkbox" t-att-checked="props.task.isCompleted"
            t-att-id="props.task.id"
            t-on-click="dispatch('toggleTask', props.task.id)" />
        <label t-att-for="props.task.id"><t t-esc="props.task.title"/></label>
        <span class="delete" t-att-class="props.task.isCompleted? 'hide' : ''" t-on-click="dispatch('deleteTask', props.task.id)">🗑</span>
    </div>`

class Task extends Component {
  static template = TASK_TEMPLATE;
  static props = ["task"];
  dispatch = useDispatch();
}

const APP_TEMPLATE = xml`
    <div class="todo-app">
        <input placeholder="Enter a new task" t-on-keyup="addTask" t-ref="add-input" />
        <div class="task-list" t-on-toggle-task="toggleTask" t-on-delete-task="deleteTask" >
          <Task task="task" t-foreach="displayedTasks" t-as="task" t-key="task.id" />
        </div>
        <div class="task-panel" t-if="tasks.length">
          <div class="task-counter">
            <t t-esc="displayedTasks.length" />
            <t t-if="displayedTasks.length lt tasks.length">
              / <t t-esc="tasks.length" />
            </t>
            <t t-if="tasks.length == 1">
              task
            </t>
            <t t-if="tasks.length > 1">
              tasks
            </t>
          </div>
          <div>
            <span t-foreach="['all', 'active', 'completed']" 
                t-as="f" t-key="f"
                t-att-class="{active: filter.value===f}"
                t-on-click="setFilter(f)"
                t-esc="f"
            />
          </div>
        </div>
    </div>`

class App extends Component {
  static template = APP_TEMPLATE;
  static components = {Task};

  inputRef = useRef("add-input");
  tasks = useStore((state) => state.tasks);
  dispatch = useDispatch();

  filter = useState({value: "all"});

  get displayedTasks(){
    switch (this.filter.value){
      case "active": return this.tasks.filter(t=>!t.isCompleted);
      case "completed": return this.tasks.filter(t=>t.isCompleted);
      case "all": return this.tasks;
    }
  }

  setFilter(filter){
    this.filter.value = filter;
  }

  mounted() {
      this.inputRef.el.focus();
  }

  addTask(ev) {
    // 13 is keycode for ENTER
    if (ev.keyCode === 13) {
      this.dispatch("addTask", ev.target.value);
      ev.target.value = "";
    }
  }
}

function makeStore() {
  const localState = window.localStorage.getItem("todoapp");
  const state = localState ? JSON.parse(localState) : initialState;
  const store = new Store({state, actions});
  store.on("update", null, () => {
    localStorage.setItem("todoapp", JSON.stringify(store.state));
  });
  return store;
}

// Setup code
function setup() {
  owl.config.mode = "dev";
  const env = {store: makeStore()};
  mount(App, { target: document.body, env });
}

whenReady(setup);
  
(function () {
  console.log("hello owl", owl.__info__.version);
})();