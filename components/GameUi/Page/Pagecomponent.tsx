'use client'
import './Pagecomponent.css'

import React from 'react'

// 定义 Props 类型
interface PageComponentProps {
    pageConfig: {
        totalPage: number
    }
    pageCallbackFn: (currentPage: number) => void
}

// 定义 State 类型
interface PageComponentState {
    currentPage: number
    groupCount: number
    startPage: number
    totalPage: number
}

class Pagecomponent extends React.Component<PageComponentProps, PageComponentState> {
    constructor(props: PageComponentProps) {
        super(props)
        this.state = {
            currentPage: 1,
            groupCount: 5,
            startPage: 1,
            totalPage: 1
        }
        this.createPage = this.createPage.bind(this)
    }

    componentDidMount() {
        this.setState({
            totalPage: this.props.pageConfig.totalPage
        })
        this.props.pageCallbackFn(this.state.currentPage)
    }

    createPage(): JSX.Element[] {
        const { currentPage, groupCount, startPage, totalPage } = this.state;
        const pages: JSX.Element[] = [];

        pages.push(
            <li
                className={currentPage === 1 ? "nomore" : undefined}
                onClick={this.prePageHandeler.bind(this)}
                key={0}
            >
                上一页
            </li>
        )

        if (totalPage <= 10) {
            for (let i = 1; i <= totalPage; i++) {
                pages.push(
                    <li
                        key={i}
                        onClick={this.pageClick.bind(this, i)}
                        className={currentPage === i ? "activePage" : undefined}
                    >
                        {i}
                    </li>
                )
            }
        } else {
            pages.push(
                <li
                    className={currentPage === 1 ? "activePage" : undefined}
                    key={1}
                    onClick={this.pageClick.bind(this, 1)}
                >
                    1
                </li>
            )

            let pageLength = 0;
            if (groupCount + startPage > totalPage) {
                pageLength = totalPage
            } else {
                pageLength = groupCount + startPage;
            }

            if (currentPage >= groupCount) {
                pages.push(<li className="" key={-1}>···</li>)
            }

            for (let i = startPage; i < pageLength; i++) {
                if (i <= totalPage - 1 && i > 1) {
                    pages.push(
                        <li
                            className={currentPage === i ? "activePage" : undefined}
                            key={i}
                            onClick={this.pageClick.bind(this, i)}
                        >
                            {i}
                        </li>
                    )
                }
            }

            if (totalPage - startPage >= groupCount + 1) {
                pages.push(<li className="" key={-2}>···</li>)
            }

            pages.push(
                <li
                    className={currentPage === totalPage ? "activePage" : undefined}
                    key={totalPage}
                    onClick={this.pageClick.bind(this, totalPage)}
                >
                    {totalPage}
                </li>
            )
        }

        pages.push(
            <li
                className={currentPage === totalPage ? "nomore" : undefined}
                onClick={this.nextPageHandeler.bind(this)}
                key={totalPage + 1}
            >
                下一页
            </li>
        )

        return pages;
    }

    pageClick = (currentPage: number) => {
        const { groupCount } = this.state
        const getCurrentPage = this.props.pageCallbackFn;

        if (currentPage >= groupCount) {
            this.setState({
                startPage: currentPage - 2,
            })
        }
        if (currentPage < groupCount) {
            this.setState({
                startPage: 1,
            })
        }
        if (currentPage === 1) {
            this.setState({
                startPage: 1,
            })
        }
        this.setState({
            currentPage
        })
        getCurrentPage(currentPage)
    }

    prePageHandeler = () => {
        let { currentPage } = this.state
        if (--currentPage === 0) {
            return false
        }
        this.pageClick(currentPage)
    }

    nextPageHandeler = () => {
        let { currentPage } = this.state
        if (++currentPage > this.state.totalPage) {
            return false
        }
        this.pageClick(currentPage)
    }

    render() {
        const pageList = this.createPage();
        return (
            <ul className="page-container">
                {pageList}
            </ul>
        )
    }
}

export default Pagecomponent