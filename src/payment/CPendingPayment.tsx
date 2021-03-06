import * as React from 'react';
import { View, BoxId, Image } from 'tonva';
import { CUqBase } from '../CBase';
import { nav } from 'tonva';
import { VPendingPayment } from './VPendingPayment';
import { VPendingPaymentDetail } from './VPendingPaymentDetail';
import { VRejectPayment } from './VRejectPayment';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { PaymentSuccess } from './PaymentSuccess';
import iconj from '../images/icon.jpg';

export class CPendingPayment extends CUqBase {

    @observable cashout: any[] = [];
    @observable cashouts: any[] = [];
    @observable agencyuser: { [agencyid: number]: any } = {};
    @observable agencyIcon: { [agencyid: number]: any } = {};

    async internalStart(param: any) {
        this.cashout = await this.uqs.ebPayment.SearchEasyBuziPayment.table(undefined);
        this.add8();
    }

    private add8() {
        function chinaOffset(d: Date): Date {
            if (d === undefined) return;
            let ret = new Date((d.getTime() + 8 * 3600 * 1000));
            return ret;
        }
        try {
            // 时差处理
            this.cashout.forEach(ch => {
                let { date, price, agency, taskid, id } = ch;
                this.cashouts.push({
                    date: chinaOffset(date) //  dayjs(ch.date).add(8, 'hour')
                    , price: price
                    , agency: agency
                    , taskid: taskid
                    , id: id
                })
            });
        }
        catch (err) {
            debugger;
        }
    }

    renderRootList() {
        return this.renderView(VPendingPayment);
    }

    getAccounts = async (agencyid: number) => {
        let agencyMap = await this.uqs.salesTask.WebUserAccountMap.query({ webuser: agencyid });
        if (agencyMap.ret.length > 0) {
            this.agencyuser[agencyid] = agencyMap.ret[0].identityname;
        } else {
            this.agencyuser[agencyid] = null;
        }
        return agencyMap.ret[0];
    }

    getAgency = async (agencyid: number) => {
        let agency = await this.uqs.salesTask.$user.load(agencyid);
        if (agency !== null && agency !== undefined) {
            this.agencyIcon[agencyid] = agency.icon;
        } else {
            this.agencyIcon[agencyid] = undefined;
        }
        return agency;
    }

    /**
    * 打开待打印任务界面
    */
    onNewRejectTask = async (task: any) => {
        this.openVPage(VRejectPayment, task);
    }

    RejectPayment = async (task: any, result: any) => {
        //确认驳回--后台数据
        let { taskid, comments } = result;
        let param = {
            pendingid: task.id,
            taskid: taskid,
            result: 0,
            comments: comments,
        };
        await this.uqs.ebPayment.AddPrintPaymentTask.submit(param);
        let index = this.cashouts.findIndex(v => v.taskid === taskid);
        this.cashouts.splice(index, 1);
        // 打开下单成功显示界面
        nav.popTo(this.cApp.topKey);
        this.openVPage(PaymentSuccess);
    }

    /**
    * 打开付款详情界面
    */
    onWebUserNameSelected = async (task: any) => {
        this.openVPage(VPendingPaymentDetail, task);
    }

    saveTask = async (task: any) => {
        //确认付款--后台数据
        let { id, taskid } = task;
        let param = {
            pendingid: id,
            taskid: taskid,
            result: 1,
            comments: ''
        };
        await this.uqs.ebPayment.AddPrintPaymentTask.submit(param);
        // 打开下单成功显示界面
        let index = this.cashouts.findIndex(v => v.id === id);
        this.cashouts.splice(index, 1);
        nav.popTo(this.cApp.topKey);
        this.openVPage(PaymentSuccess);
    }

    renderInventory = (agencyid: BoxId) => {
        return this.renderView(VInventoryView, agencyid);
    }
    renderUserIcon = (agencyid: BoxId) => {
        return this.renderView(VUserIconView, agencyid);
    }
}

export class VInventoryView extends View<CPendingPayment> {

    render(param: any): JSX.Element {
        let { controller } = this;
        controller.getAccounts(param);
        return <this.contentagency agencyid={param} />
    }
    protected contentagency = observer((param: any) => {
        let LocationUI;
        let { agencyid } = param;
        LocationUI = <div className="text-muted small">{this.controller.agencyuser[agencyid]}</div>;
        return LocationUI;
    });
}

export class VUserIconView extends View<CPendingPayment> {

    render(param: any): JSX.Element {
        let { controller } = this;
        controller.getAgency(param);
        return <this.contentagencyUser agencyid={param} />
    }
    protected contentagencyUser = observer((param: any) => {
        let { agencyid } = param;
        let icon = this.controller.agencyIcon[agencyid];
        let identityimage = icon === undefined ? <Image src={iconj} className="w-2c h-2c circle" style={{ borderRadius: '50%' }} /> : <Image src={icon} className="w-2c h-2c circle" style={{ borderRadius: '50%' }} />;
        return <span>{identityimage}</span>;
    });
}
