import React, { useState } from 'react'

function App() {
  const [theme, setTheme] = useState('light')

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <div className="hero min-h-96 bg-gradient-to-r from-primary to-secondary">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-primary-content">Hello DaisyUI 5!</h1>
            <p className="py-6 text-primary-content">
              Testing Daisy UI 5 + Tailwind CSS 4 integration with React
            </p>
            <button className="btn btn-primary" onClick={toggleTheme}>
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8 space-y-8">
        {/* Buttons */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Buttons</h2>
            <div className="flex flex-wrap gap-2">
              <button className="btn">Default</button>
              <button className="btn btn-primary">Primary</button>
              <button className="btn btn-secondary">Secondary</button>
              <button className="btn btn-accent">Accent</button>
              <button className="btn btn-ghost">Ghost</button>
              <button className="btn btn-link">Link</button>
              <button className="btn btn-outline">Outline</button>
              <button className="btn btn-active">Active</button>
              <button className="btn btn-disabled" disabled>Disabled</button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Alerts</h2>
            <div className="space-y-4">
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>New software update available.</span>
              </div>
              <div className="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Your purchase has been confirmed!</span>
              </div>
              <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Warning: Invalid email address!</span>
              </div>
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Error! Task failed successfully.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Form Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">What is your name?</span>
                </label>
                <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
                <label className="label">
                  <span className="label-text-alt">Bottom Left label</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Remember me</span>
                  <input type="checkbox" defaultChecked className="checkbox" />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Red pill</span>
                  <input type="radio" name="radio-10" className="radio checked:bg-red-500" defaultChecked />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Blue pill</span>
                  <input type="radio" name="radio-10" className="radio checked:bg-blue-500" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Badge & Loading */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Badges & Loading</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="badge">neutral</div>
              <div className="badge badge-primary">primary</div>
              <div className="badge badge-secondary">secondary</div>
              <div className="badge badge-accent">accent</div>
              <div className="badge badge-ghost">ghost</div>

              <span className="loading loading-spinner loading-xs"></span>
              <span className="loading loading-spinner loading-sm"></span>
              <span className="loading loading-spinner loading-md"></span>
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card w-96 bg-base-100 shadow-xl">
            <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
            <div className="card-body">
              <h2 className="card-title">
                Shoes!
                <div className="badge badge-secondary">NEW</div>
              </h2>
              <p>If a dog chews shoes whose shoes does he choose?</p>
              <div className="card-actions justify-end">
                <div className="badge badge-outline">Fashion</div>
                <div className="badge badge-outline">Products</div>
              </div>
            </div>
          </div>

          <div className="card w-96 bg-primary text-primary-content">
            <div className="card-body">
              <h2 className="card-title">Card title!</h2>
              <p>If a dog chews shoes whose shoes does he choose?</p>
              <div className="card-actions justify-end">
                <button className="btn">Buy Now</button>
              </div>
            </div>
          </div>

          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Card with badge</h2>
              <p>Rerum reiciendis beatae tenetur excepturi aut pariatur est eos. Sit sit necessitatibus veritatis sed molestiae voluptates incidunt iure sapiente.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">Buy Now</button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Progress Bars</h2>
            <div className="space-y-4">
              <progress className="progress w-56" value={0} max="100"></progress>
              <progress className="progress progress-primary w-56" value={10} max="100"></progress>
              <progress className="progress progress-secondary w-56" value={40} max="100"></progress>
              <progress className="progress progress-accent w-56" value={70} max="100"></progress>
              <progress className="progress progress-info w-56" value={80} max="100"></progress>
              <progress className="progress progress-success w-56" value={100} max="100"></progress>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App