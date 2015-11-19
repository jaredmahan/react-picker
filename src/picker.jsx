import React from 'react'


let Picker = React.createClass({

    propTypes: {
        value: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number, React.PropTypes.array]).isRequired
        , options: React.PropTypes.array.isRequired
        , onChange: React.PropTypes.func
        , onShow: React.PropTypes.func
        , onDismiss: React.PropTypes.func
        , onClickAway: React.PropTypes.func
    }

    , getDefaultProps () {
        return {
            onChange(value, text, idx) {}
        }
    }

    , getInitialState () {
        return {
            value: this.props.value
            , options: this.props.options
            , open: false
        }
    }
    , componentWillReceiveProps(nextProps){
        this.setState({
            value: nextProps.value
            , options: nextProps.options
        })
    }

    , optionHeight: 0
    , componentDidMount () {
        let op = this.refs['op-0-0']
        if (op) {
            this.optionHeight = React.findDOMNode(op).clientHeight
        }
        this._initValueIndexes.forEach((vi, idx) => {
            if (vi > 0) {
                let node = React.findDOMNode( this.refs['list-'+idx] )
                node.scrollTop = this._scrollStartTop = vi * this.optionHeight
            }
        })
        //window.addEventListener('scroll', this._onPageScroll)
    }
    , componentWillUnmount () {
        //window.removeEventListener('scroll', this._onPageScroll)
    }

    , value() {
        return this.state.value
    }

    , render() {

        let values = this.state.value
            , __options = this.state.options
        if ( ! Array.isArray(values)) {
            values = [values]
            __options = [__options]
        }

        let initValueIndexes = []
        let style = {
            width: (100 / __options.length) + '%'
        }
        let i = -1 //counter for __options, for it is an array or key-map object
        let lists = __options.map((options) => {
            if (!options)
                return
            i++
            let j = -1 //counter for options, for it is an array or key-map object
            return (
                <div
                    key={i}
                    ref={'list-'+i}
                    data-id={i}
                    className="list-wrap"
                    style={style}
                    onScroll={this._onScroll}
                    >
                    <ul>
                        {
                            options.map((op) => {
                                j++
                                if (typeof op === 'string' || typeof op === 'number') {
                                    op = {
                                        text: op
                                        , value: op
                                    }
                                }
                                else if ((typeof op !== 'object') || !op.text || !op.value)
                                    return

                                if (String(op.value) === String(values[i])) {
                                    initValueIndexes.push(j)
                                }

                                return (
                                    <li key={j}
                                        ref={`op-${i}-${j}`}
                                        data-id={`${i}-${j}`}
                                        data-value={JSON.stringify(op)}
                                        onClick={this._clickOnOption}
                                        >
                                        {op.text}
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            )
        })

        this._initValueIndexes = initValueIndexes

        return (
            <div className={["picker", this.props.className].join(' ')}>
                {this.props.children}
                <div className={["container", "table", this.props.className, (this.state.open ? "show" : undefined)].join(' ')}>
                    <div className="overlay" onClick={this._handleOverlayTouchTap} />
                    <div className="cell">
                        <div className={["popup", (this.state.open ? "show" : undefined)].join(' ')}>
                            {lists}
                            <div className="cover upper"/>
                            <div className="cover lower"/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    , closeable: false

    , dismiss() {
        if (this.closeable) {
            this._onDismiss()
        }
    }

    , show() {
        // prevent rapid show/hide
        this._onShow()
    }

    ,  _handleOverlayTouchTap() {
        if (this.closeable) {
            this._onDismiss()
            this.props.onClickAway && this.props.onClickAway()
        }
    }

    , _onShow() {
        setTimeout(function(){this.closeable = true;}.bind(this), 250)
        this.setState({ open: true })
        this.props.onShow && this.props.onShow()
    }

    , _onDismiss() {
        this.setState({ open: false, loading: false })
        this.props.onDismiss && this.props.onDismiss()
    }

    , _onPageScroll(e) {
    }

    , _scrollStartTop: 0
    , _scrollTimer: undefined
    , _onScroll(e) {
        let el = e.target
            , idx = parseInt(el.dataset ? el.dataset.id : el.getAttribute('data-id'), 10)
            , opHeight = this.optionHeight

        window.clearTimeout( this._scrollTimer )
        this._scrollTimer = window.setTimeout( () => {
            if (this._scrollStartTop === el.scrollTop)
                return

            let scrollTop = el.scrollTop
                , mod = scrollTop % opHeight
                , percent = mod / opHeight

            let toLowerItem = () => {
                let diff = opHeight - mod
                scrollTop += diff
                el.scrollTop += diff
            }
            let toUpperItem = () => {
                scrollTop -= mod
                el.scrollTop -= mod
            }

            if (scrollTop > this._scrollStartTop) {
                percent > 0.46 ? toLowerItem() : toUpperItem()
            }
            else {
                percent < 0.64 ? toUpperItem() : toLowerItem()
            }
            this._scrollStartTop = scrollTop

            let opname = `op-${idx}-${scrollTop / opHeight}`
            let op = React.findDOMNode( this.refs[opname] ).getAttribute('data-value')
            if (!op)
                return
            op = JSON.parse(op)

            let value = this.state.value
            if (Array.isArray(value)) {
                value[idx] = op.value
            } else {
                value = op.value
            }
            this.setState({
                value: value
            })
            this.props.onChange(op.value, op.text, idx)
        }, 250)
    }

    , _clickOnOption(e) {
        let el = e.target
            , value = el.dataset ? el.dataset.id : el.getAttribute('data-id')
        if ( ! value )
            return

        let arr = value.split('-')
        if (arr.length < 2)
            return

        let _list = this.refs['list-' + arr[0]]
        if (!_list)
            return
        let list = React.findDOMNode(_list)
        list.scrollTop = this.optionHeight * parseInt(arr[1], 10)
    }

})

export default Picker
