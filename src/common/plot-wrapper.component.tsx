import * as React from 'react';
import { GetGuid } from './plot-state.utils';
import Plotly, { Plots } from 'plotly.js';
import {
  IPlotWrapperProps,
  EnhancedPlotElement,
} from './plot-wrapper.contracts';
import {
  PLOT_EVENT_NAMES as eventNames,
  PLOT_UPDATE_EVENTS as updateEvents,
} from './plot-wrapper.constants';

const isBrowser = typeof window !== 'undefined';

export interface IPlotWrapperState {}

/*
TODO-
- stuff from the factory
    for (let i = 0; i < eventNames.length; i++) {
        PlotlyComponent.propTypes['on' + eventNames[i]] = PropTypes.func;
    }
    return PlotlyComponent;
    */


/**
 * DOM element wrapper for plotly.js
 */
export class PlotWrapper extends React.Component<
  IPlotWrapperProps,
  IPlotWrapperState
> {
  static defaultProps = {
    debug: false,
    useResizeHandler: true,
    data: [],
    divId: GetGuid(),
    revision: 0,
    style: { position: 'relative', display: 'inline-block' },
  };

  state = {};
  el: EnhancedPlotElement;
  p: Promise<void> = Promise.resolve();
  resizeHandler: () => void = null;
  handlers: { [idx: string]: Function } = {};

  syncWindowResize = (propsIn: IPlotWrapperProps, invoke?) => {
    const props = propsIn || this.props;
    if (!isBrowser) return;

    if (props.useResizeHandler && !this.resizeHandler) {
      this.resizeHandler = () => {
        return Plots.resize(this.el);
      };
      window.addEventListener('resize', this.resizeHandler);
      if (invoke) {
        this.resizeHandler();
      }
    } else if (!props.useResizeHandler && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  };

  attachUpdateEvents = () => {
    if (!this.el || !this.el.removeListener) return;

    for (let i = 0; i < updateEvents.length; i++) {
      this.el.on(updateEvents[i], this.handleUpdate);
    }
  };

  removeUpdateEvents() {
    if (!this.el || !this.el.removeListener) return;

    for (let i = 0; i < updateEvents.length; i++) {
      this.el.removeListener(updateEvents[i], this.handleUpdate);
    }
  }

  constructor(p: IPlotWrapperProps) {
    super(p);
    this.getRef = this.getRef.bind(this);
  }

  getRef = el => {
    this.el = el;

    if (this.props.debug && isBrowser) {
      (window as any).gd = this.el;
      console.warn('Plot Wrapper: Debug mode activated');
    }
  };

  handleUpdate = () => {
    this.figureCallback(this.props.onUpdate);
  };

  figureCallback = callback => {
    if (typeof callback === 'function') {
      const { data, layout } = this.el;
      const frames = this.el._transitionData
        ? this.el._transitionData._frames
        : null;
      const figure = { data, layout, frames }; // for extra clarity!
      callback(figure, this.el);
    }
  };

  // #CLTODO: refactor to new lifecycle methods: https://reactjs.org/docs/react-component.html#getsnapshotbeforeupdate
  UNSAFE_componentWillUpdate(nextProps: IPlotWrapperProps) {
    if (
      nextProps.revision !== void 0 &&
      nextProps.revision === this.props.revision
    ) {
      // if revision is set and unchanged, do nothing
      return;
    }

    const numPrevFrames =
      this.props.frames && this.props.frames.length
        ? this.props.frames.length
        : 0;
    const numNextFrames =
      nextProps.frames && nextProps.frames.length ? nextProps.frames.length : 0;
    if (
      nextProps.layout === this.props.layout &&
      nextProps.data === this.props.data &&
      nextProps.config === this.props.config &&
      numNextFrames === numPrevFrames
    ) {
      // prevent infinite loops when component is re-rendered after onUpdate
      // frames *always* changes identity so fall back to check length only :(
      return;
    }

    this.p = this.p
      .then(() => {
        return Plotly.react(this.el, {
          data: nextProps.data,
          layout: nextProps.layout,
          config: nextProps.config,
          frames: nextProps.frames,
        } as any);
      })
      .then(() => this.syncEventHandlers(nextProps))
      .then(() => this.syncWindowResize(nextProps))
      .then(() => this.figureCallback(nextProps.onUpdate))
      .catch(err => {
        console.error('Error while plotting:', err);
        this.props.onError && this.props.onError(err);
      });
  }

  componentDidMount() {
    this.p = this.p
      .then(() => {
        return Plotly.newPlot(this.el, {
          data: this.props.data,
          layout: this.props.layout,
          config: this.props.config,
          frames: this.props.frames,
        } as any);
      })
      .then(() => this.syncWindowResize(null, true))
      .then(this.syncEventHandlers)
      .then(this.attachUpdateEvents)
      .then(() => this.figureCallback(this.props.onInitialized))
      .catch(err => {
        console.error('Error while plotting:', err);
        return this.props.onError && this.props.onError(err);
      });
  }

  componentWillUnmount() {
    this.figureCallback(this.props.onPurge);

    if (this.resizeHandler && isBrowser) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    this.removeUpdateEvents();

    Plotly.purge(this.el);
  }

  forcePurge = () => {
    if (this.el) {
      Plotly.purge(this.el);
    }
  };

  // Attach and remove event handlers as they're added or removed from props:
  syncEventHandlers = propsIn => {
    // Allow use of nextProps if passed explicitly:
    const props = propsIn || this.props;

    for (let i = 0; i < eventNames.length; i++) {
      const eventName = eventNames[i];
      const prop = props['on' + eventName];
      const hasHandler = !!this.handlers[eventName];

      if (prop && !hasHandler) {
        this.handlers[eventName] = prop;
        this.el.on(
          'plotly_' + eventName.toLowerCase(),
          this.handlers[eventName]
        );
      } else if (!prop && hasHandler) {
        // Needs to be removed:
        this.el.removeListener(
          'plotly_' + eventName.toLowerCase(),
          this.handlers[eventName]
        );
        delete this.handlers[eventName];
      }
    }
  };

  render() {
    return (
      <div
        id={this.props.divId}
        style={this.props.style}
        ref={this.getRef}
        className={this.props.className}
      />
    );
  }
}
