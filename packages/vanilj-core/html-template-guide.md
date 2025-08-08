# VanilJ HTML Template Guide

A comprehensive guide to writing reactive HTML templates with VanilJ's custom template engine.

## Why a Custom Template Engine?

VanilJ uses a custom HTML template engine instead of existing solutions like HTM (Hyperscript Tagged Markup) because of the need for deep integration with VanilJ's specific reactivity model. After extensive testing, we found that existing template literal solutions would be difficult to implement in a way that plays nicely with VanilJ's signal-based reactivity system.

The custom engine provides:
- **Seamless Signal Integration**: Direct binding of signals to DOM updates
- **Optimized Event Handling**: Smart event listener management
- **Robust Attribute Spreading**: Reliable object spreading for attributes
- **Performance**: Minimal overhead with maximum reactivity

## Core Concepts

### Template Literal Syntax

VanilJ templates use tagged template literals with the `html` function:

```javascript
import { html, signal } from '../vanilj-core.js';

const count = signal(0);

const template = html`
  <div class="counter">
    <span>Count: ${() => count.value}</span>
    <button onclick="${() => count.value++}">Increment</button>
  </div>
`;
```

### How It Works Under the Hood

The template engine follows a multi-step process:

1. **Placeholder Injection**: Dynamic values are replaced with HTML comment placeholders (`<!--::0::-->`)
2. **Attribute Spread Pre-processing**: Transforms `${props}` patterns to avoid browser parsing issues
3. **DOM Parsing**: Uses the browser's native HTML parser via `<template>` elements
4. **Reactive Binding**: Sets up `effect`s for dynamic content and attributes
5. **Cleanup**: Removes temporary markers and optimizes the final DOM

## Essential Patterns and Best Practices

### 1. Reactive Content

**✅ DO: Use functions or signals for dynamic content**

```javascript
// From TaskItem.js - reactive class binding
html`
  <div class="${() => `task-item ${selectedTaskId() === task.id ? 'selected' : ''}`}">
    <span class="${() => `task-title ${task.completed ? 'completed' : ''}`}">
      ${task.title}
    </span>
  </div>
`;
```

**❌ DON'T: Use static signal values**

```javascript
// This will only render once, not reactively
html`<div>${mySignal.value}</div>`;

// Instead, use a function
html`<div>${() => mySignal.value}</div>`;
```

### 2. Event Handlers

**✅ DO: Pass function references directly**

```javascript
// From HeaderPanel.js - proper event handler binding
const handleSearchInput = (e) => {
  setSearchQuery(e.target.value);
};

html`
  <input
    type="text"
    oninput="${handleSearchInput}"
  />
`;
```

**✅ DO: Use inline arrow functions for simple cases**

```javascript
// From TaskItem.js - inline event handlers
html`
  <input
    type="checkbox"
    onchange="${(e) => toggleTodo(task.id)}"
  />
  <div onclick="${() => selectTask(task.id)}">
    <!-- content -->
  </div>
`;
```

**❌ DON'T: Use complex expressions in event attributes**

```javascript
// This won't work as expected
html`<button onclick="() => ${doSomething()}">Click</button>`;

// Instead, create a proper function
const handleClick = () => doSomething();
html`<button onclick="${handleClick}">Click</button>`;
```

### 3. Conditional Rendering

**✅ DO: Use ternary operators or logical AND**

```javascript
// From TaskItem.js - conditional content
html`
  ${task.description
    ? html`<p class="task-description">${task.description}</p>`
    : ''}
    
  ${task.priority && task.priority !== 'normal'
    ? `<div class="task-priority priority-${task.priority}">${task.priority}</div>`
    : ''}
`;
```

**✅ DO: Use functions for complex conditional logic**

```javascript
const renderStatus = () => {
  if (task.completed) return html`<span class="status completed">✓ Done</span>`;
  if (task.urgent) return html`<span class="status urgent">⚠ Urgent</span>`;
  return html`<span class="status pending">⏳ Pending</span>`;
};

html`<div class="task">${renderStatus}</div>`;
```

### 4. List Rendering

**✅ DO: Return arrays of elements from functions**

```javascript
// Reactive list rendering
const renderTasks = () => {
  return filteredTodos.value.map(task => 
    html`<div class="task">${task.title}</div>`
  );
};

html`
  <div class="task-list">
    ${renderTasks}
  </div>
`;
```

**✅ DO: Use computed signals for complex lists**

```javascript
import { computed } from '../vanilj-core.js';

const taskElements = computed(() => 
  todos.value.map(task => TaskItem({ task, onDeleteRequest }))
);

html`<div class="tasks">${taskElements}</div>`;
```

### 5. Component Composition

**✅ DO: Embed components using functions**

```javascript
// From HeaderPanel.js - component composition
html`
  <div class="app-title">
    ${() => UIIcon({
      name: 'check-circle',
      size: 'md',
      variant: 'primary',
      class: 'logo'
    })}
    <h1>Todo App</h1>
    ${() => MainMenu({
      onOpenSettings,
      onOpenHelp
    })}
  </div>
`;
```

### 6. Attribute Spreading

**✅ DO: Use object spreading for dynamic attributes**

```javascript
const buttonProps = {
  class: 'btn btn-primary',
  disabled: isLoading.value,
  'data-testid': 'submit-btn'
};

html`<button ${buttonProps}>Submit</button>`;
```

**How it works**: The engine transforms this into a `data-vanilj-props` attribute during pre-processing, then applies the object properties after DOM parsing.

### 7. Boolean Attributes

**✅ DO: Use boolean values for boolean attributes**

```javascript
// From TaskItem.js - boolean attribute binding
html`
  <input
    type="checkbox"
    checked="${task.completed}"
    disabled="${() => isLoading.value}"
  />
`;
```

The engine automatically handles the difference between DOM properties and HTML attributes.

### 8. Dynamic Classes and Styles

**✅ DO: Combine static and dynamic parts**

```javascript
// Simple dynamic classes
html`<div class="base ${() => isActive.value ? 'active' : ''}">Content</div>`;

// Complex class logic with computed
const classes = computed(() => {
  const base = ['task-item'];
  if (isSelected.value) base.push('selected');
  if (task.completed) base.push('completed');
  if (task.urgent) base.push('urgent');
  return base.join(' ');
});

html`<div class="${classes}">Task</div>`;
```

**✅ DO: Use objects for conditional classes**

```javascript
const classObj = computed(() => ({
  'task-item': true,
  'selected': isSelected.value,
  'completed': task.completed,
  'urgent': task.urgent
}));

const classString = computed(() => 
  Object.entries(classObj.value)
    .filter(([_, active]) => active)
    .map(([className]) => className)
    .join(' ')
);

html`<div class="${classString}">Task</div>`;
```

## Advanced Patterns

### Custom Reactive Attributes

```javascript
// Reactive data attributes
html`
  <div
    data-task-id="${task.id}"
    data-status="${() => task.completed ? 'done' : 'pending'}"
    aria-label="${() => `Task: ${task.title}, ${task.completed ? 'completed' : 'active'}`}"
  >
    ${task.title}
  </div>
`;
```

### Form Input Binding

```javascript
const formData = signal({ name: '', email: '' });

html`
  <form>
    <input
      type="text"
      value="${() => formData.value.name}"
      oninput="${(e) => formData.value = { ...formData.value, name: e.target.value }}"
    />
    <input
      type="email"
      value="${() => formData.value.email}"
      oninput="${(e) => formData.value = { ...formData.value, email: e.target.value }}"
    />
  </form>
`;
```

### Nested Templates

```javascript
const renderHeader = () => html`
  <header>
    <h1>${() => title.value}</h1>
    <nav>${() => renderNavigation()}</nav>
  </header>
`;

const renderNavigation = () => html`
  <ul>
    ${() => navItems.value.map(item => html`
      <li><a href="${item.url}">${item.label}</a></li>
    `)}
  </ul>
`;

const app = html`
  <div class="app">
    ${renderHeader}
    <main>${() => renderContent()}</main>
  </div>
`;
```

## Performance Tips

### 1. Minimize Effect Creation

**✅ DO: Use computed signals for complex calculations**

```javascript
// Good: Single computed signal
const taskSummary = computed(() => 
  `${todos.value.length} tasks, ${todos.value.filter(t => t.completed).length} completed`
);

html`<div class="summary">${taskSummary}</div>`;

// Avoid: Multiple function calls
html`<div class="summary">${() => 
  `${todos.value.length} tasks, ${todos.value.filter(t => t.completed).length} completed`
}</div>`;
```

### 2. Stable References for Event Handlers

**✅ DO: Define event handlers outside the template when possible**

```javascript
// Good: Stable function reference
const handleClick = (e) => {
  e.preventDefault();
  doSomething();
};

html`<button onclick="${handleClick}">Click</button>`;

// Avoid: New function on every render
html`<button onclick="${(e) => { e.preventDefault(); doSomething(); }}">Click</button>`;
```

### 3. Batch DOM Updates

```javascript
import { batch } from '../vanilj-core.js';

const updateMultipleValues = () => {
  batch(() => {
    name.value = 'New Name';
    email.value = 'new@email.com';
    status.value = 'updated';
  });
};
```

## Common Pitfalls and Solutions

### 1. Event Handler Not Firing

**Problem**: Event handler is a string instead of a function

```javascript
// Wrong
html`<button onclick="handleClick">Click</button>`;

// Correct
html`<button onclick="${handleClick}">Click</button>`;
```

### 2. Non-Reactive Content

**Problem**: Using signal values directly instead of functions

```javascript
// Wrong - only renders once
html`<div>${count.value}</div>`;

// Correct - reactive
html`<div>${() => count.value}</div>`;
```

### 3. Attribute Spreading Not Working

**Problem**: Trying to spread non-objects or using incorrect syntax

```javascript
// Wrong
html`<div ${{class: 'test'}}>Content</div>`;

// Correct
const props = { class: 'test', id: 'my-div' };
html`<div ${props}>Content</div>`;
```

## Comparison with Other Systems

### VanilJ vs JSX

| Feature | VanilJ | JSX |
|---------|--------|-----|
| **Syntax** | HTML template literals | XML-like syntax |
| **Reactivity** | Built-in signals | External state management |
| **Event Handlers** | Direct function binding | Synthetic events |
| **Build Step** | None required | Requires transpilation |
| **Learning Curve** | Familiar HTML | New syntax to learn |

### VanilJ vs HTM

| Feature | VanilJ | HTM |
|---------|--------|-----|
| **Reactivity** | Native signal integration | Manual updates |
| **Performance** | Optimized for signals | Generic template system |
| **Attribute Spreading** | Robust pre-processing | Limited support |
| **Event Handling** | Optimized binding | Standard DOM events |

## Real-World Examples

All examples in this guide are taken from the actual VanilJ Todo application. You can find the complete source code in:

- [`TaskItem.js`](../../../src/ui/components/TaskItem.js) - Individual task rendering
- [`HeaderPanel.js`](../../../src/ui/components/HeaderPanel.js) - App header with search and stats
- [`App.js`](../../../src/ui/components/App.js) - Main application layout

## Choosing the Right Rendering Pattern: `html` vs. `createElement`

VanilJ provides two distinct approaches for creating components, each with specific strengths and use cases. Understanding when to use each pattern is crucial for building robust, maintainable applications.

### The Two Patterns

#### 1. Declarative `html` Templates (Recommended for Most Cases)

**Best for**: Simple, presentation-focused components that don't need immediate DOM access.

```javascript
import { html, signal } from '../vanilj-core.js';

// Simple layout component
export function UiContainer(props = {}, ...children) {
  const { direction = 'row', gap = '0', class: className = '' } = props;
  
  return html`
    <div class="ui-container ${className}" style="display: flex; flex-direction: ${direction}; gap: ${gap};">
      ${children}
    </div>
  `;
}
```

**Advantages**:
- Clean, readable HTML-like syntax
- Automatic reactivity with signals
- Minimal boilerplate
- Familiar to developers with HTML/template experience

**Limitations**:
- **No `ref` support**: Cannot get immediate DOM element references
- **Timing constraints**: Element is not available until after rendering
- **Limited DOM manipulation**: Difficult to perform imperative DOM operations

#### 2. Imperative `createElement` / `tags` Pattern (For Complex Interactions)

**Best for**: Interactive components that need immediate DOM access, event listeners, or imperative DOM manipulation.

```javascript
import { tags, effect } from '../vanilj-core.js';

const { div } = tags;

// Interactive component with DOM access
export function UiSplitter(props = {}) {
  const { size = '4px', color = '#ccc', onResize } = props;
  
  // Create element with immediate access
  const splitterElement = div({
    class: 'ui-splitter',
    style: `flex: 0 0 ${size}; background-color: ${color}; cursor: col-resize;`,
    onpointerdown: handlePointerDown,
    onmouseenter: handleMouseEnter,
    onmouseleave: handleMouseLeave
  },
    div({ class: 'splitter-handle', style: 'width: 100%; height: 100%;' })
  );
  
  // Immediate DOM access for setup
  function handlePointerDown(e) {
    // Can access splitterElement immediately
    const prevElement = splitterElement.previousElementSibling;
    const nextElement = splitterElement.nextElementSibling;
    // ... drag logic
  }
  
  return splitterElement;
}
```

**Advantages**:
- **Immediate DOM access**: Element reference available instantly
- **Direct event binding**: Events attached at creation time
- **Imperative control**: Full control over DOM manipulation
- **No timing issues**: No race conditions with element availability

**Trade-offs**:
- More verbose syntax
- Less HTML-like appearance
- Requires understanding of DOM API

### When to Use Each Pattern

| Use `html` Templates When: | Use `createElement`/`tags` When: |
|---------------------------|----------------------------------|
| ✅ Building layout components | ✅ Need immediate DOM element access |
| ✅ Displaying data reactively | ✅ Implementing drag-and-drop |
| ✅ Simple event handling | ✅ Measuring element dimensions |
| ✅ Conditional rendering | ✅ Complex event listener management |
| ✅ List rendering | ✅ Imperative DOM manipulation |
| ✅ Form inputs with basic binding | ✅ Third-party library integration |

### Real-World Example: UiSplitter Component

The `UiSplitter` component demonstrates why the `createElement` pattern is sometimes necessary:

**Problem with `html` Template Approach**:
```javascript
// This approach failed because ref doesn't work with html templates
import { html, ref, effect } from '../vanilj-core.js';

export function UiSplitter(props = {}) {
  const splitterRef = ref();
  
  const element = html`
    <div ref=${splitterRef} class="ui-splitter">
      <!-- ref never gets set properly -->
    </div>
  `;
  
  effect(() => {
    // splitterRef.current is always null!
    if (splitterRef.current) {
      splitterRef.current.addEventListener('pointerdown', handleDrag);
    }
  });
  
  return element;
}
```

**Solution with `createElement` Pattern**:
```javascript
// This works because we have immediate element access
import { tags, effect } from '../vanilj-core.js';

const { div } = tags;

export function UiSplitter(props = {}) {
  const splitterElement = div({
    class: 'ui-splitter',
    onpointerdown: handlePointerDown, // Direct event binding
    onmouseenter: handleMouseEnter,
    onmouseleave: handleMouseLeave
  });
  
  // Element is immediately available for DOM operations
  function detectDirection() {
    let element = splitterElement.parentElement;
    // ... can access DOM immediately
  }
  
  return splitterElement;
}
```

### Mixing Patterns (Advanced)

You can combine both patterns within a single component:

```javascript
import { html, tags } from '../vanilj-core.js';

const { div } = tags;

export function ComplexComponent(props) {
  // Create interactive element imperatively
  const interactiveElement = div({
    class: 'interactive-part',
    onpointerdown: handleInteraction
  });
  
  // Embed in declarative template
  return html`
    <div class="component-wrapper">
      <header class="component-header">
        <h2>Component Title</h2>
      </header>
      ${interactiveElement}
      <footer class="component-footer">
        <p>Static footer content</p>
      </footer>
    </div>
  `;
}
```

### Key Takeaways

1. **Start with `html` templates** for most components - they're simpler and more readable
2. **Switch to `createElement`** when you need immediate DOM access or complex interactions
3. **The `html` template system doesn't support `ref` attributes** - this is a known limitation
4. **Both patterns produce standard DOM nodes** and can be mixed freely
5. **Choose based on component needs**, not personal preference

html template: The simple, fast, declarative 90% solution.
createElement: The powerful, imperative 10% solution for when you need more control.

### Common Pitfalls

**❌ Trying to use `ref` with `html` templates**:
```javascript
// This doesn't work - ref attribute is not supported
const elementRef = ref();
html`<div ref=${elementRef}>Content</div>`;
```

**✅ Use `createElement` when you need element references**:
```javascript
// This works - immediate element access
const element = div({ class: 'my-element' });
// element is available immediately
```

**❌ Overcomplicating simple components**:
```javascript
// Unnecessary complexity for a simple component
const { div, span } = tags;
return div({ class: 'simple' }, span({}, 'Hello World'));
```

**✅ Use `html` for simple, declarative components**:
```javascript
// Much cleaner for simple cases
return html`<div class="simple"><span>Hello World</span></div>`;
```

## Next Steps

1. **Explore the Source**: Check out [`html-template.js`](../html-template.js) to understand the implementation
2. **Try Examples**: Experiment with the patterns shown in this guide
3. **Read Other Docs**: Learn about [signals](../vanilj-core.js) and [store management](store.md)
4. **Build Components**: Start creating your own reactive components
5. **Study Real Examples**:
   - [`UiSplitter.js`](../../../src/ui/layout/flex/ui-splitter.js) - `createElement` pattern
   - [`UiContainer.js`](../../../src/ui/layout/flex/ui-container.js) - `html` template pattern
   - [`ConfirmationDialog.js`](../../../src/ui/components/ConfirmationDialog.js) - Mixed approach

---

**Remember**: VanilJ's template system is designed to feel familiar while providing powerful reactivity. When in doubt, think "HTML first" and add reactivity where needed. Use `createElement` only when the component's functionality demands immediate DOM access.