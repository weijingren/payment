import * as React from 'react';
import { CHome } from './CHome';
import { Page, View } from 'tonva';
import { VSiteHeader } from './VSiteHeader';


export class VHome extends View<CHome> {

    async open(param?: any) {
        this.openPage(this.page);
    }

    render(param: any): JSX.Element {
        return <this.content />
    }

    private page = () => {
        return <Page header={false}>
            <this.content />
        </Page>;
    };

    private content = () => {
        let { controller } = this;
        let { toCashOutList } = controller;
        let siteHeader = this.renderVm(VSiteHeader);
        return <>
            {siteHeader}
            {toCashOutList()}
        </>
    };
}