import * as React from 'react';
import { VPage, Page } from 'tonva';
import { CPendingPayment } from './CPendingPayment';

export class PaymentSuccess extends VPage<CPendingPayment> {

    async open() {

        this.openPage(this.page);
    }

    private page = () => {
        return <Page header="操作成功" back="close" headerClassName="bg-primary">
            <div className="p-3 bg-white mb-3">
                <div className="mb-3">操作成功！</div>
            </div>
        </Page>
    }
}