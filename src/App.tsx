'use client';

import { useMemo, useState } from 'react';
import styles from './floorplans.module.css';

type RecordState = 'confirmed-layout' | 'partial' | 'unverified';
type ViewMode = 'model' | 'source' | 'data';

type UnitRecord = {
  id: string;
  building: string;
  floor: number;
  slot: string;
  type: string;
  areaLabel: string;
  orientation: string;
  actualArea: string;
  actualRate: string;
  indoorUse: string;
  outdoorUse: string;
  parity: string;
  state: RecordState;
  source: string;
  sourceImage?: string;
  modelImage?: string;
  dataImage?: string;
  note: string;
};

const siteBuildings = [
  { id: '1#', floors: '2–11层', homes: '95㎡、104㎡' },
  { id: '2#', floors: '2–11层', homes: '95㎡、104㎡' },
  { id: '3#', floors: '2–16/17层', homes: '105㎡、108㎡、134㎡' },
  { id: '5#', floors: '2–16/17层', homes: '105㎡、128㎡、134㎡' },
  { id: '6#', floors: '2–10层', homes: '104㎡' },
  { id: '7#', floors: '2–14/17层', homes: '128㎡' },
  { id: '8#', floors: '2–15/16层', homes: '105㎡、108㎡' },
];

const buildingOptions = [
  { id: '1#', label: '1#', range: '资料页：2–11层', state: 'confirmed-layout' as RecordState },
  { id: '2#', label: '2#', range: '分布图可见', state: 'unverified' as RecordState },
  { id: '3#', label: '3#', range: '分布图可见', state: 'unverified' as RecordState },
  { id: '4#', label: '4#', range: '分布图可见', state: 'unverified' as RecordState },
  { id: '5#', label: '5#', range: '资料页：2–17层', state: 'confirmed-layout' as RecordState },
  { id: '6#', label: '6#', range: '资料页：2–10层', state: 'confirmed-layout' as RecordState },
  { id: '7#', label: '7#', range: '分布图可见', state: 'unverified' as RecordState },
  { id: '8#', label: '8#', range: '分布图可见', state: 'unverified' as RecordState },
];

const sourceFor = (building: string, floor: number) => {
  if (building === '5#') return floor === 2 ? 'IMG_9295' : floor === 3 ? 'IMG_9296' : floor === 4 ? 'IMG_9297' : floor === 17 ? 'IMG_9300' : floor % 2 === 0 ? 'IMG_9298' : 'IMG_9299';
  if (building === '1#') return floor === 2 ? 'IMG_9301' : floor === 3 ? 'IMG_9302' : floor === 4 ? 'IMG_9303' : floor === 5 ? 'IMG_9304' : 'IMG_9305';
  if (building === '6#') return floor === 2 ? 'IMG_9306' : floor === 3 ? 'IMG_9307' : floor === 4 ? 'IMG_9308' : floor === 5 ? 'IMG_9309' : 'IMG_9310';
  return '';
};
const sourceImageFor = (building: string, floor: number) => `/floorplans/sources/${sourceFor(building, floor)}.jpg`;
const wholeFloorModelFor = (building: string, floor: number) => {
  if (building === '1#') return `/floorplans/whole-floor/1-${floor <= 5 ? `${floor}F` : '6-11F'}.jpg`;
  if (building === '5#') return `/floorplans/whole-floor/5-${floor === 2 || floor === 3 || floor === 4 || floor === 17 ? `${floor}F` : floor % 2 === 0 ? 'even' : 'odd'}.jpg`;
  if (building === '6#') return `/floorplans/whole-floor/6-${floor <= 5 ? `${floor}F` : '6-10F'}.jpg`;
  return '';
};

const sixData: Record<number, Record<'102'|'105', { property: string; gift: string; ratio: string; outdoor: string; actual: string; rate: string }>> = {
  2:{'102':{property:'102.81㎡',gift:'24.73㎡',ratio:'24.05%',outdoor:'15.73㎡',actual:'109.96㎡',rate:'106.95%'},'105':{property:'105.93㎡',gift:'23.21㎡',ratio:'21.91%',outdoor:'17.81㎡',actual:'112.06㎡',rate:'105.79%'}},
  3:{'102':{property:'103.48㎡',gift:'30.50㎡',ratio:'29.47%',outdoor:'15.73㎡',actual:'117.27㎡',rate:'113.33%'},'105':{property:'107.32㎡',gift:'28.98㎡',ratio:'27.00%',outdoor:'17.81㎡',actual:'119.83㎡',rate:'111.66%'}},
  4:{'102':{property:'103.47㎡',gift:'32.13㎡',ratio:'31.05%',outdoor:'15.73㎡',actual:'118.80㎡',rate:'114.82%'},'105':{property:'108.37㎡',gift:'32.10㎡',ratio:'29.62%',outdoor:'17.81㎡',actual:'123.66㎡',rate:'114.11%'}},
  5:{'102':{property:'105.32㎡',gift:'33.62㎡',ratio:'31.92%',outdoor:'15.73㎡',actual:'121.56㎡',rate:'115.42%'},'105':{property:'105.01㎡',gift:'23.21㎡',ratio:'22.10%',outdoor:'17.81㎡',actual:'112.06㎡',rate:'106.71%'}},
  6:{'102':{property:'102.81㎡',gift:'24.73㎡',ratio:'24.05%',outdoor:'15.73㎡',actual:'109.96㎡',rate:'106.95%'},'105':{property:'105.93㎡',gift:'23.21㎡',ratio:'21.91%',outdoor:'17.81㎡',actual:'112.06㎡',rate:'105.79%'}},
};
const sixMetric = (floor:number, type:'102'|'105') => sixData[floor] ? sixData[floor][type] : sixData[6][type];

const oneSummary: Record<number, {a95:string; a95r:string; b104:string; b104r:string}> = {
  2:{a95:'107.40㎡',a95r:'110.48%',b104:'116.76–118.83㎡',b104r:'111.87–113.85%'},
  3:{a95:'116.81㎡',a95r:'111.62%',b104:'103.87–120.31㎡',b104r:'105.18–112.37%'},
  4:{a95:'117.29㎡',a95r:'109.64%',b104:'106.21–119.12㎡',b104r:'108.05–111.61%'},
  5:{a95:'109.98㎡',a95r:'104.77%',b104:'108.89–123.41㎡',b104r:'112.84–114.06%'},
  6:{a95:'109.98㎡',a95r:'104.77%',b104:'97.95–111.81㎡',b104r:'101.98–106.77%'},
};
const oneMetric = (floor:number) => oneSummary[floor] || oneSummary[6];

type AreaRow = { type:string; slot:string; property:string; gift:string; ratio:string; indoor?:string; outdoor:string; actual:string; rate:string };
const ar=(type:string,slot:string,property:string,gift:string,ratio:string,indoor:string,outdoor:string,actual:string,rate:string):AreaRow=>({type,slot,property,gift,ratio,indoor,outdoor,actual,rate});
const oneAreaRows: Record<string, AreaRow[]> = {
  '2':[ar('A-95㎡','1梯01户','97.21','26.48','27.24%','17.51','15.05','107.40','110.48%'),ar('B-104㎡','1梯02户','105.31','30.58','29.04%','20.24','17.81','118.83','112.84%'),ar('B-104㎡','2梯01户','104.37','29.64','28.40%','20.24','15.74','116.76','111.87%'),ar('B-104㎡','2梯02户','104.37','30.58','29.30%','20.24','17.81','118.83','113.85%'),ar('B-104㎡','3梯01户','104.40','30.58','29.29%','20.24','17.81','118.83','113.82%'),ar('B-104㎡','3梯02户','104.65','29.69','28.37%','20.30','15.73','116.81','111.62%')],
  '3':[ar('A-95㎡','1梯01户','98.75','21.84','22.12%','12.87','15.05','103.87','105.18%'),ar('B-104㎡','1梯02户','108.01','30.11','27.88%','19.77','17.81','120.31','111.39%'),ar('B-104㎡','2梯01户','107.04','29.17','27.25%','19.77','15.73','118.23','110.45%'),ar('B-104㎡','2梯02户','107.07','30.11','28.12%','19.77','17.81','120.31','112.37%'),ar('B-104㎡','3梯01户','107.10','30.11','28.11%','19.77','17.81','120.31','112.33%'),ar('B-104㎡','3梯02户','106.98','28.04','26.21%','18.64','15.73','117.29','109.64%')],
  '4':[ar('A-95㎡','1梯01户','98.30','24.53','24.95%','15.56','15.05','106.21','108.05%'),ar('B-104㎡','1梯02户','107.66','28.92','26.86%','18.58','17.81','119.12','110.64%'),ar('B-104㎡','2梯01户','106.70','27.98','26.22%','18.58','15.73','117.04','109.69%'),ar('B-104㎡','2梯02户','106.73','28.92','27.10%','18.58','17.81','119.12','111.61%'),ar('B-104㎡','3梯01户','106.76','28.92','27.09%','18.58','17.81','119.12','111.58%'),ar('B-104㎡','3梯02户','104.97','22.27','21.22%','12.87','15.73','109.98','104.77%')],
  '5':[ar('A-95㎡','1梯01户','96.50','28.95','30.00%','19.98','15.05','108.89','112.84%'),ar('B-104㎡','1梯02户','109.14','32.04','29.36%','21.70','17.81','123.41','113.07%'),ar('B-104㎡','2梯01户','108.17','31.10','28.75%','21.70','15.73','121.33','112.17%'),ar('B-104㎡','2梯02户','108.20','32.04','29.61%','21.70','17.81','123.41','114.06%'),ar('B-104㎡','3梯01户','108.23','32.04','29.60%','21.70','17.81','123.41','114.03%'),ar('B-104㎡','3梯02户','104.97','22.27','21.22%','12.87','15.73','109.98','104.77%')],
  '6-11':[ar('A-95㎡','1梯01户','96.05','18.01','18.75%','9.04','15.05','97.95','101.98%'),ar('B-104㎡','1梯02户','105.64','23.15','21.91%','12.81','17.81','111.81','105.84%'),ar('B-104㎡','2梯01户','104.69','22.21','21.22%','12.81','15.73','109.73','104.81%'),ar('B-104㎡','2梯02户','104.72','23.15','22.11%','12.81','17.81','111.81','106.77%'),ar('B-104㎡','3梯01户','104.75','23.15','22.10%','12.81','17.81','111.81','106.74%'),ar('B-104㎡','3梯02户','104.97','22.27','21.22%','12.87','15.73','109.98','104.77%')]
};
const fiveRows=(floor:number):AreaRow[]=>{
  const even134a=ar('E偶数-134㎡','2梯01户',floor===2?'134.48':'134.48','84.77','63.04%','48.83','42.62','192.65','143.26%');
  const even134b=ar('E偶数-134㎡','2梯02户','134.47','84.83','63.08%','48.89','42.62','192.71','143.31%');
  const odd134a=ar('E奇数-134㎡','2梯01户','134.02','74.93','55.91%','49.30','32.31','182.41','136.11%');
  const odd134b=ar('E奇数-134㎡','2梯02户','134.45','74.93','55.73%','49.30','32.31','182.77','135.94%');
  if(floor===2)return [ar('C2-104㎡','1梯01户','106.96','26.78','25.04%','16.92','17.26','115.30','107.80%'),ar('F偶数-129㎡','1梯02户','128.88','58.84','45.65%','47.73','18.86','164.26','127.45%'),even134a,even134b];
  if(floor===3)return [ar('C2-104㎡','1梯01户','106.80','27.74','25.97%','17.88','17.26','116.02','108.63%'),ar('F奇数-129㎡','1梯02户','129.02','59.78','46.33%','48.67','18.86','165.70','128.43%'),odd134a,odd134b];
  if(floor===4)return [ar('C2-104㎡','1梯01户','108.43','33.80','31.17%','23.94','17.26','123.31','113.72%'),ar('F偶数-129㎡','1梯02户','128.88','58.84','45.65%','47.73','18.86','164.26','127.45%'),even134a,even134b];
  if(floor===17)return [odd134a,odd134b];
  return floor%2===0?[ar('C2-104㎡','1梯01户','104.96','24.71','23.54%','14.85','17.26','111.55','106.28%'),ar('F偶数-129㎡','1梯02户','128.88','58.84','45.65%','47.73','18.86','164.26','127.45%'),even134a,even134b]:[ar('C2-104㎡','1梯01户','104.95','24.71','23.54%','14.85','17.26','111.55','106.28%'),ar('F奇数-129㎡','1梯02户','129.02','59.78','46.33%','48.67','18.86','165.70','128.43%'),odd134a,odd134b];
};
function areaRowsFor(record:UnitRecord):AreaRow[]{
  if(record.building==='1#') return oneAreaRows[record.floor<=5?String(record.floor):'6-11'];
  if(record.building==='5#') return fiveRows(record.floor);
  if(record.building==='6#') return (['102','105'] as const).map((type)=>{const m=sixMetric(record.floor,type);return {type:`B-1-${type}㎡`,slot:type==='102'?'1梯01户':'1梯02户',property:m.property.replace('㎡',''),gift:m.gift.replace('㎡',''),ratio:m.ratio,outdoor:m.outdoor.replace('㎡',''),actual:m.actual.replace('㎡',''),rate:m.rate};});
  return [];
}

const records: UnitRecord[] = [
  ...Array.from({ length: 10 }, (_, i) => i + 2).flatMap((floor) => [
    {
      id: `1-${floor}-104`, building: '1#', floor, slot: '01/02位104㎡户型', type: '104㎡户型',
      areaLabel: '建筑面积约104㎡', orientation: '待北向标识复核', actualArea: oneMetric(floor).b104, actualRate: oneMetric(floor).b104r,
      indoorUse: floor <= 5 ? '12.87–21.70㎡（同层不同梯位）' : '9.04–12.87㎡', outdoorUse: floor <= 5 ? '15.05–17.81㎡' : '15.05–17.81㎡', parity: floor % 2 === 0 ? '偶层' : '奇层',
      state: 'confirmed-layout' as RecordState, source: `1#楼${floor}层平面图`, sourceImage: sourceImageFor('1#', floor), modelImage: '/floorplans/models/104.jpg',
      note: '立体图对应104㎡基础户型；具体露台赠送部位以本层原始资料页为准。',
    },
    {
      id: `1-${floor}-95`, building: '1#', floor, slot: '1单元端户', type: '95㎡户型',
      areaLabel: '建筑面积约95㎡', orientation: '待北向标识复核', actualArea: oneMetric(floor).a95, actualRate: oneMetric(floor).a95r,
      indoorUse: floor <= 5 ? '18.58–20.30㎡' : '12.87㎡', outdoorUse: floor <= 5 ? '15.73㎡' : '15.73㎡', parity: floor % 2 === 0 ? '偶层' : '奇层',
      state: 'confirmed-layout' as RecordState, source: `1#楼${floor}层平面图`, sourceImage: sourceImageFor('1#', floor), modelImage: '/floorplans/models/95.jpg',
      note: '95㎡位于1单元端部；高楼层是否保留同样户外空间需结合本层原图判断。',
    },
  ]),
  ...Array.from({ length: 16 }, (_, i) => i + 2).flatMap((floor) => {
    const rows: UnitRecord[] = [{
      id: `5-${floor}-134`, building: '5#', floor, slot: '2单元01/02位', type: floor % 2 === 0 ? '134㎡偶层户型' : '134㎡奇层户型',
      areaLabel: '建筑面积约134㎡', orientation: '待北向标识复核', actualArea: floor === 2 ? '192.65–192.71㎡（01/02户）' : '逐套表请在数据页核对', actualRate: floor === 2 ? '143.26%–143.31%' : floor % 2 === 0 ? '宣传页综合使用率约143%' : '宣传页综合使用率约136%',
      indoorUse: floor % 2 === 0 ? '宣传页约48㎡' : '宣传页约49㎡', outdoorUse: floor % 2 === 0 ? '约34㎡入户平台＋12㎡北露台＋27㎡南露台' : '约22㎡北露台＋23㎡平台＋16㎡南露台',
      parity: floor % 2 === 0 ? '偶层' : '奇层', state: 'confirmed-layout', source: `5#楼${floor}层平面图`, sourceImage: sourceImageFor('5#', floor), modelImage: floor % 2 === 0 ? '/floorplans/models/134-even.jpg' : '/floorplans/models/134-odd.jpg',
      note: '134㎡已按奇偶层分别配置立体图；户外平台面积依据户型宣传页，逐套实际面积仍以房号表为准。',
    }];
    if (floor < 17) rows.push({
      id: `5-${floor}-129`, building: '5#', floor, slot: '1单元中间位', type: '129㎡户型', areaLabel: '图上标注129㎡', orientation: '待北向标识复核',
      actualArea: floor === 2 ? '164.26㎡' : '逐套表请在数据页核对', actualRate: floor === 2 ? '127.45%' : '逐套表请在数据页核对', indoorUse: floor === 2 ? '总赠送58.84㎡｜赠送比例45.65%' : '待核对', outdoorUse: floor === 2 ? '18.86㎡' : '按本层原图核对', parity: floor % 2 === 0 ? '偶层' : '奇层',
      state: 'confirmed-layout', source: `5#楼${floor}层平面图`, sourceImage: sourceImageFor('5#', floor), modelImage: '/floorplans/models/129.jpg', note: '129㎡立体图从5#标准层中单独提取；不同楼层的赠送部位请同时查看原始资料页。',
    }, {
      id: `5-${floor}-104`, building: '5#', floor, slot: '1单元端户', type: '104㎡户型', areaLabel: '图上标注104㎡', orientation: '待北向标识复核',
      actualArea: floor === 2 ? '115.30㎡' : '逐套表请在数据页核对', actualRate: floor === 2 ? '107.80%' : '逐套表请在数据页核对', indoorUse: floor === 2 ? '总赠送26.78㎡｜赠送比例25.04%' : '待核对', outdoorUse: floor === 2 ? '17.26㎡' : floor === 3 ? '3F阳台约7.45㎡' : floor === 4 ? '4F阳台约8.91㎡' : floor === 5 ? '5F阳台约11.74㎡' : '按本层原图核对', parity: floor % 2 === 0 ? '偶层' : '奇层',
      state: 'confirmed-layout', source: `5#楼${floor}层平面图`, sourceImage: sourceImageFor('5#', floor), modelImage: '/floorplans/models/104.jpg', note: '104㎡基础布局已转成立体图；阳台尺度随楼层变化，数字只取当前原图可辨识标注。',
    });
    return rows;
  }),
  ...Array.from({ length: 9 }, (_, i) => i + 2).flatMap((floor) => [
    {
      id: `6-${floor}-105`, building: '6#', floor, slot: '1梯02户', type: 'B-105㎡户型', areaLabel: `产权面积${sixMetric(floor,'105').property}`, orientation: '待北向标识复核', actualArea: sixMetric(floor,'105').actual, actualRate: sixMetric(floor,'105').rate,
      indoorUse: `总赠送${sixMetric(floor,'105').gift}｜赠送比例${sixMetric(floor,'105').ratio}`, outdoorUse: sixMetric(floor,'105').outdoor, parity: floor % 2 === 0 ? '偶层' : '奇层',
      state: 'confirmed-layout' as RecordState, source: `6#楼${floor}层平面图`, sourceImage: sourceImageFor('6#', floor), modelImage: '/floorplans/models/105.jpg', note: '105㎡立体图对应左侧户型；各层黄色阳台标注存在差异。',
    },
    {
      id: `6-${floor}-102`, building: '6#', floor, slot: '1梯01户', type: 'B-1-102㎡户型', areaLabel: `产权面积${sixMetric(floor,'102').property}`, orientation: '待北向标识复核', actualArea: sixMetric(floor,'102').actual, actualRate: sixMetric(floor,'102').rate,
      indoorUse: `总赠送${sixMetric(floor,'102').gift}｜赠送比例${sixMetric(floor,'102').ratio}`, outdoorUse: sixMetric(floor,'102').outdoor, parity: floor % 2 === 0 ? '偶层' : '奇层',
      state: 'confirmed-layout' as RecordState, source: `6#楼${floor}层平面图`, sourceImage: sourceImageFor('6#', floor), modelImage: '/floorplans/models/102.jpg', note: '右侧户型在楼层图上明确标注102㎡，未擅自改写为104㎡。',
    },
  ]),
];

type DimensionProfile = { image: string; title: string; facts: string[]; sourceNote: string };
const dimensionProfiles: Record<string, DimensionProfile> = {
  '95': { image:'/floorplans/dimensions/95.jpg', title:'95㎡花园洋房尺寸标注', facts:['约3.4m面宽阳台','约2.1m主卧转角落地窗','约15㎡入户花园','层高约3.05m','综合使用率约102%'], sourceNote:'取自“璟悦 95㎡花园洋房”户型说明页' },
  '104': { image:'/floorplans/dimensions/104.jpg', title:'104㎡花园洋房尺寸标注', facts:['约43㎡一体化大通厅','约5.4m面宽阳台','约17㎡独梯入户大花园','层高约3.05m','综合使用率约107%'], sourceNote:'取自“璟舒 104㎡花园洋房”户型说明页' },
  '105': { image:'/floorplans/dimensions/105.jpg', title:'105㎡小高层尺寸标注', facts:['约43㎡一体化大通厅','约5.4m面宽阳台','约17㎡独梯入户大花园','规划收纳约40m³','综合使用率约106%'], sourceNote:'取自“璟逸 105㎡小高层”户型说明页' },
  '128-even': { image:'/floorplans/dimensions/128-even.jpg', title:'128㎡偶层尺寸标注', facts:['约5m面宽客厅','约30㎡南向露台','约8㎡北向露台','约18㎡独梯入户大花园','约2.6m长互动吧台'], sourceNote:'取自“璟庭 128㎡（偶）小高层”户型说明页' },
  '128-odd': { image:'/floorplans/dimensions/128-odd.jpg', title:'128㎡奇层尺寸标注', facts:['约5m面宽客厅','约23㎡南露台','约15㎡北露台','约20㎡独梯入户大花园','约2.6m长互动吧台'], sourceNote:'取自“璟庭 128㎡（奇）小高层”户型说明页' },
  '134-even': { image:'/floorplans/dimensions/134-even.jpg', title:'134㎡偶层尺寸标注', facts:['约5m面宽客厅','约27㎡南向露台','约12㎡北向露台','约34㎡绿化休闲平台','约25㎡星级套卧'], sourceNote:'取自“璟院 134㎡（偶）小高层”户型说明页' },
  '134-odd': { image:'/floorplans/dimensions/134-odd.jpg', title:'134㎡奇层尺寸标注', facts:['约5m面宽客厅','约16㎡南露台','约22㎡北露台','约23㎡绿化休闲平台','约25㎡星级套卧'], sourceNote:'取自“璟院 134㎡（奇）小高层”户型说明页' },
};
type ModelAnnotation = { x: number; y: number; label: string };
function modelAnnotationsFor(record: UnitRecord): ModelAnnotation[] {
  if (record.type.includes('134') && record.parity === '偶层') return [
    {x:27,y:23,label:'约34㎡绿化休闲平台'}, {x:61,y:28,label:'约12㎡北向露台'}, {x:38,y:67,label:'约5m面宽客厅'}, {x:46,y:88,label:'约27㎡南向露台'}, {x:78,y:57,label:'约25㎡主卧套房｜约3m衣柜'}, {x:53,y:66,label:'可拓展约4.5开间朝南'}
  ];
  if (record.type.includes('134') && record.parity === '奇层') return [
    {x:43,y:25,label:'约22㎡北露台'}, {x:23,y:75,label:'约23㎡绿化休闲平台'}, {x:38,y:62,label:'约5m面宽客厅'}, {x:70,y:82,label:'约16㎡南露台'}, {x:77,y:57,label:'约25㎡主卧套房｜约3m衣柜'}, {x:53,y:63,label:'可拓展约4.5开间朝南'}
  ];
  if (record.type.includes('128') && record.parity === '偶层') return [
    {x:61,y:27,label:'约18㎡入户花园'}, {x:29,y:34,label:'约8㎡北向露台'}, {x:61,y:65,label:'约5m面宽客厅'}, {x:56,y:87,label:'约30㎡南向露台'}, {x:51,y:43,label:'约2.6m长互动吧台'}, {x:39,y:63,label:'可拓展约4.5开间朝南'}
  ];
  if (record.type.includes('128') && record.parity === '奇层') return [
    {x:61,y:23,label:'约20㎡入户花园'}, {x:43,y:35,label:'约15㎡北露台'}, {x:62,y:63,label:'约5m面宽客厅'}, {x:39,y:86,label:'约23㎡南露台'}, {x:54,y:43,label:'约2.6m长互动吧台'}, {x:42,y:63,label:'可拓展约4.5开间朝南'}
  ];
  if (record.type.includes('105')) return [
    {x:36,y:24,label:'约17㎡入户花园'}, {x:36,y:64,label:'约43㎡一体化大通厅'}, {x:36,y:86,label:'约5.4m面宽阳台'}, {x:59,y:61,label:'可拓展四开间朝南'}
  ];
  if (record.type.includes('104')) return [
    {x:58,y:23,label:'约17㎡入户花园'}, {x:62,y:65,label:'约43㎡一体化大通厅'}, {x:62,y:86,label:'约5.4m面宽阳台'}, {x:38,y:63,label:'可拓展四开间朝南'}
  ];
  if (record.type.includes('95')) return [
    {x:36,y:23,label:'约15㎡入户花园'}, {x:31,y:68,label:'客餐厅'}, {x:31,y:87,label:'约3.4m面宽阳台'}, {x:72,y:55,label:'约2.1m主卧转角落地窗'}
  ];
  return [];
}

function modelStatsFor(record: UnitRecord): string[] {
  if (record.type.includes('134')) return record.parity === '偶层' ? ['综合使用率约143%','规划收纳约42m³','户内拓展约48㎡','户外使用约42㎡'] : ['综合使用率约136%','规划收纳约42m³','户内拓展约49㎡','户外使用约32㎡'];
  if (record.type.includes('128')) return record.parity === '偶层' ? ['综合使用率约127%','规划收纳约42m³','户内拓展约47㎡','户外使用约18㎡'] : ['综合使用率约128%','规划收纳约42m³','户内拓展约48㎡','户外使用约18㎡'];
  if (record.type.includes('105')) return ['综合使用率约106%','规划收纳约40m³','户内拓展约14㎡','户外使用约17㎡'];
  if (record.type.includes('104')) return ['综合使用率约107%','层高约3.05m','规划收纳约40m³','户内拓展约12㎡','户外使用约17㎡'];
  if (record.type.includes('95')) return ['综合使用率约102%','层高约3.05m','规划收纳约31m³','户内拓展约9㎡','户外使用约15㎡'];
  return [];
}

function dimensionProfileFor(record: UnitRecord): DimensionProfile | undefined {
  if (record.type.includes('134')) return dimensionProfiles[record.parity === '偶层' ? '134-even' : '134-odd'];
  if (record.type.includes('128')) return dimensionProfiles[record.parity === '偶层' ? '128-even' : '128-odd'];
  if (record.type.includes('105')) return dimensionProfiles['105'];
  if (record.type.includes('104')) return dimensionProfiles['104'];
  if (record.type.includes('95')) return dimensionProfiles['95'];
}

const stateLabel: Record<RecordState, string> = {
  'confirmed-layout': '布局已核实',
  partial: '部分核实',
  unverified: '资料待补',
};

function placeholderRecord(building: string, floor: number, index: number): UnitRecord {
  return {
    id: `${building}-${floor}-pending-${index}`, building, floor, slot: `待核对位置${index + 1}`, type: '户型待核对',
    areaLabel: '面积待核对', orientation: '朝向待核对', actualArea: '实际得房面积待核对', actualRate: '得房率待核对',
    indoorUse: '待补充', outdoorUse: '待补充', parity: floor % 2 === 0 ? '偶层' : '奇层', state: 'unverified', source: '当前资料未覆盖',
    note: `${building} ${floor}层目前只有总平分布信息，缺少可逐户核对的平面表和房号表。`,
  };
}

export default function FloorplanWorkbench() {
  const [building, setBuilding] = useState('5#');
  const [floor, setFloor] = useState(4);
  const [selectedId, setSelectedId] = useState('5-4-134');
  const [view, setView] = useState<ViewMode>('model');
  const [showSources, setShowSources] = useState(false);

  const buildingInfo = buildingOptions.find((item) => item.id === building) || buildingOptions[0];
  const availableFloors = useMemo(() => {
    if (building === '5#') return Array.from({ length: 16 }, (_, index) => index + 2);
    if (building === '6#') return Array.from({ length: 9 }, (_, index) => index + 2);
    if (building === '1#') return Array.from({ length: 10 }, (_, index) => index + 2);
    return Array.from({ length: 17 }, (_, index) => index + 1);
  }, [building]);

  const visibleRecords = useMemo(() => {
    const rows = records.filter((item) => item.building === building && item.floor === floor);
    return rows.length ? rows : [placeholderRecord(building, floor, 0), placeholderRecord(building, floor, 1)];
  }, [building, floor]);
  const selected = visibleRecords.find((item) => item.id === selectedId) || visibleRecords[0];

  function selectBuilding(next: string) {
    const nextFloors = next === '5#' ? Array.from({ length: 16 }, (_, index) => index + 2) : next === '6#' ? Array.from({ length: 9 }, (_, index) => index + 2) : next === '1#' ? Array.from({ length: 10 }, (_, index) => index + 2) : Array.from({ length: 17 }, (_, index) => index + 1);
    const nextFloor = next === '5#' ? 4 : nextFloors[0];
    setBuilding(next); setFloor(nextFloor); setSelectedId(next === '5#' ? `5-${nextFloor}-134` : '');
  }

  function selectFloor(next: number) {
    setFloor(next);
    const nextRecord = records.find((item) => item.building === building && item.floor === next);
    setSelectedId(nextRecord?.id || '');
  }

  const knownCount = records.length;
  const sourceCount = new Set(records.map((item) => item.source)).size;

  return <main className={styles.page}>
    <header className={styles.topbar}>
      <div className={styles.brand}><span className={styles.logo}>鲤</span><div><p>建发 · 璟鲤</p><h1>户型查房工具</h1></div></div>
      <div className={styles.topActions}><span className={styles.privateTag}><i />销售内部使用</span><span>手机公开查询版</span></div>
    </header>

    <section className={styles.intro}>
      <div><span className={styles.kicker}>QUICK UNIT VIEWER</span><h2>客户问哪套，<em>马上打开给他看。</em></h2><p>按楼栋、楼层和图上位置筛选，查看户型立体示意、原始平面页、面积字段与朝向核对状态。</p></div>
      <div className={styles.metrics}><div><b>{knownCount}</b><span>已录入示意位</span></div><div><b>{sourceCount}</b><span>份核实资料页</span></div><div><b>—</b><span>朝向待补数据</span></div></div>
    </section>

    <section className={styles.sitePlanCard}>
      <div className={styles.sitePlanHead}><div><span className={styles.kicker}>3D BUILDING MAP</span><h3>璟鲤立体楼栋分布</h3><p>依据你上传的楼栋分布图重建立体总览；点击楼栋即可进入对应查询。</p></div><div className={styles.sitePlanKey}><span><i />立体空间示意</span><button onClick={() => setShowSources((current) => !current)}>{showSources ? '收起原始分布图' : '查看原始分布图'}</button></div></div>
      <div className={styles.sitePlanBody}>
        <div className={styles.sitePlanVisual}>
          <img src={showSources ? '/floorplans/siteplan/璟鲤楼栋分布-参考图.jpg' : '/floorplans/siteplan/璟鲤-立体楼栋分布.jpg'} alt={showSources ? '璟鲤原始楼栋分布资料图' : '璟鲤立体楼栋分布示意'} />
          {!showSources && <div className={styles.mapLabels}>
            <button className={styles.mapLabel} data-building="1" onClick={() => selectBuilding('1#')}><b>1#</b><span>2–11层</span><small>95 / 104㎡</small></button>
            <button className={styles.mapLabel} data-building="2" onClick={() => selectBuilding('2#')}><b>2#</b><span>2–11层</span><small>95 / 104㎡</small></button>
            <button className={styles.mapLabel} data-building="3" onClick={() => selectBuilding('3#')}><b>3#</b><span>2–16/17层</span><small>105 / 108 / 134㎡</small></button>
            <button className={styles.mapLabel} data-building="5" onClick={() => selectBuilding('5#')}><b>5#</b><span>2–16/17层</span><small>105 / 128 / 134㎡</small></button>
            <button className={styles.mapLabel} data-building="6" onClick={() => selectBuilding('6#')}><b>6#</b><span>2–10层</span><small>104㎡</small></button>
            <button className={styles.mapLabel} data-building="7" onClick={() => selectBuilding('7#')}><b>7#</b><span>2–14/17层</span><small>128㎡</small></button>
            <button className={styles.mapLabel} data-building="8" onClick={() => selectBuilding('8#')}><b>8#</b><span>2–15/16层</span><small>105 / 108㎡</small></button>
          </div>}
          <div className={styles.sitePlanBadge}>{showSources ? '原始资料核对图' : '楼号 · 层数 · 户型面积已标注'}</div>
        </div>
        <div className={styles.siteBuildingList}>{siteBuildings.map((item) => <button key={item.id} onClick={() => selectBuilding(item.id)} className={building === item.id ? styles.siteBuildingActive : ''}><strong>{item.id}</strong><span>{item.floors}</span><small>{item.homes}</small><em>进入查询 →</em></button>)}</div>
      </div>
      <div className={styles.sitePlanNote}>楼栋位置、层数和户型面积取自上传的楼栋分布图；立体画面用于快速理解空间关系，不作为规划、施工或交付依据。</div>
    </section>

    <section className={styles.controlCard}>
      <div className={styles.controlHead}><div><span className={styles.step}>01</span><div><b>定位客户咨询的房源</b><small>选楼栋后再选楼层，右侧会同步刷新</small></div></div><span className={styles.sourceStatus}><i />资料来源：已上传图片</span></div>
      <div className={styles.buildingRow}>{buildingOptions.map((item) => <button key={item.id} className={item.id === building ? styles.buildingActive : ''} onClick={() => selectBuilding(item.id)}><strong>{item.label}</strong><small>{item.range}</small><em data-state={item.state}>{stateLabel[item.state]}</em></button>)}</div>
      <div className={styles.floorRow}><span>楼层</span><div>{availableFloors.map((item) => <button key={item} className={item === floor ? styles.floorActive : ''} onClick={() => selectFloor(item)}>{item}<small>F</small></button>)}</div><span className={styles.parity}>{floor % 2 === 0 ? '偶层资料' : '奇层资料'}</span></div>
    </section>

    <section className={styles.workspace}>
      <aside className={styles.unitList}>
        <div className={styles.listHead}><div><span className={styles.kicker}>UNIT LIST</span><h3>{building} · {floor}层</h3></div><span>{visibleRecords.length} 个位置</span></div>
        <p className={styles.listNote}>点击位置后，右侧显示对应的户型卡片。当前资料不完整的字段会明确标注。</p>
        <div className={styles.unitButtons}>{visibleRecords.map((item) => <button key={item.id} className={item.id === selected.id ? styles.unitActive : ''} onClick={() => setSelectedId(item.id)}><span className={styles.unitIndex}>{String(visibleRecords.indexOf(item) + 1).padStart(2, '0')}</span><div><strong>{item.type}</strong><small>{item.slot} · {item.areaLabel}</small></div><em data-state={item.state}>{stateLabel[item.state]}</em></button>)}</div>
        <div className={styles.listFooter}><span>图上位置≠房号</span><span>朝向必须以北向标识或正式表格核对</span></div>
      </aside>

      <article className={styles.detail}>
        <div className={styles.detailHead}><div><span className={styles.kicker}>UNIT DETAIL · {selected.building} / {selected.floor}F</span><h3>{selected.type}</h3><p>{selected.slot} · {selected.parity} · {selected.areaLabel}</p></div><span className={styles.statePill} data-state={selected.state}>{stateLabel[selected.state]}</span></div>
        <div className={styles.viewTabs}><button className={view === 'model' ? styles.tabActive : ''} onClick={() => setView('model')}>立体示意＋尺寸</button><button className={view === 'source' ? styles.tabActive : ''} onClick={() => setView('source')}>本层平面图</button><button className={view === 'data' ? styles.tabActive : ''} onClick={() => setView('data')}>面积数据表</button><button onClick={() => setShowSources((current) => !current)}>{showSources ? '收起核对说明' : '查看核对说明'} <span>↗</span></button></div>
        {view === 'model' ? <ModelPreview record={selected} /> : view === 'source' ? <SourcePreview record={selected} /> : <DataPreview record={selected} />}
        {showSources && <div className={styles.sourceBox}><b>这张卡片能说什么</b><p>{selected.note}</p><small>宣传时请把“建筑面积、实际得房面积、户外使用、朝向”分开表达；待核对字段不要对客户报确定数字。</small></div>}
        <div className={styles.detailGrid}><Metric label="产权面积" value={selected.areaLabel.replace('建筑面积约', '')} /><Metric label="实际得房面积" value={selected.actualArea} /><Metric label="实际得房率" value={selected.actualRate} /><Metric label="朝向" value={selected.orientation} emphasis={selected.orientation === '待核对'} /><Metric label="户内拓展" value={selected.indoorUse} /><Metric label="户外使用" value={selected.outdoorUse} wide /></div>
        <div className={styles.detailFoot}><span>来源：{selected.source}</span><span>建发 · 璟鲤｜AI立体示意，不作为交付或施工依据</span></div>
      </article>
    </section>

    <footer className={styles.footer}><span><i /> 当前为资料核对版，已读清内容才会进入户型卡片</span><span>下一步：补齐房号表与北向标识后，可逐套录入实际得房面积和坐向</span></footer>
  </main>;
}

function Metric({ label, value, emphasis = false, wide = false }: { label: string; value: string; emphasis?: boolean; wide?: boolean }) {
  return <div className={`${styles.metric} ${wide ? styles.metricWide : ''}`}><span>{label}</span><b className={emphasis ? styles.pending : ''}>{value}</b></div>;
}

function ModelPreview({ record }: { record: UnitRecord }) {
  const wholeFloorImage = wholeFloorModelFor(record.building, record.floor);
  const floorRows = areaRowsFor(record);
  if (wholeFloorImage) return <div className={styles.modelStage}>
    <div className={styles.modelTopline}><span>{record.building}·{record.floor}层整层立体图</span><span>根据本层平面图单独生成</span></div>
    <div className={styles.modelCanvas}><img className={styles.wholeFloorImage} src={wholeFloorImage} alt={`${record.building}${record.floor}层整层立体示意图`} /></div>
    <div className={styles.floorUnitGrid}>{floorRows.map((row)=><div key={`${row.slot}-${row.type}`} className={row.slot === record.slot ? styles.floorUnitActive : ''}><strong>{row.slot}</strong><span>{row.type}</span><small>产权 {row.property}㎡</small><b>实际 {row.actual}㎡</b><em>{row.rate}</em></div>)}</div>
    <div className={styles.modelLegend}><span><i className={styles.legendRoom} />整层立体示意</span><span><i className={styles.legendGarden} />花园/露台空间</span><span>户号与面积已按本层数据表对应</span></div>
  </div>;
  if (record.modelImage) return <div className={styles.modelStage}>
    <div className={styles.modelTopline}><span>对应户型立体视图</span><span>尺寸与面积取自已上传户型说明图</span></div>
    {modelStatsFor(record).length > 0 && <div className={styles.modelStats}>{modelStatsFor(record).map((item) => <span key={item}>{item}</span>)}</div>}
    <div className={styles.modelCanvas}><img className={styles.modelImage} src={record.modelImage} alt={`${record.type}立体户型图`} />{modelAnnotationsFor(record).map((item) => <span key={item.label} className={styles.modelMark} style={{left:`${item.x}%`,top:`${item.y}%`}}>{item.label}</span>)}</div>
    <div className={styles.modelLegend}><span><i className={styles.legendRoom} />室内功能区</span><span><i className={styles.legendGarden} />花园/露台</span><span>请同时核对本层原始资料页</span></div>
  </div>;
  const isGarden = record.type.includes('134');
  return <div className={styles.modelStage}>
    <div className={styles.modelTopline}><span>空间理解视图</span><span>示意 · 不是CAD模型</span></div>
    <svg className={styles.modelSvg} viewBox="0 0 720 410" role="img" aria-label={`${record.type}立体户型示意`}>
      <defs><linearGradient id="floorGradient" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#f9eee5"/><stop offset="1" stopColor="#e9c9b4"/></linearGradient><linearGradient id="roomGradient" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#fffaf5"/><stop offset="1" stopColor="#efd9c9"/></linearGradient></defs>
      <polygon points="124,302 420,348 643,235 350,189" fill="url(#floorGradient)" stroke="#b98b73" strokeWidth="2" />
      <polygon points="124,302 124,177 350,76 350,189" fill="#ead1c0" stroke="#b98b73" strokeWidth="2" />
      <polygon points="350,189 350,76 643,125 643,235" fill="#f5e3d6" stroke="#b98b73" strokeWidth="2" />
      <polygon points="152,278 152,205 302,137 302,208" fill="url(#roomGradient)" stroke="#c3947a" strokeWidth="2" />
      <polygon points="309,247 309,140 430,161 430,266" fill="#fffaf6" stroke="#c3947a" strokeWidth="2" />
      <polygon points="438,266 438,163 612,190 612,235" fill="#f8eee7" stroke="#c3947a" strokeWidth="2" />
      <polygon points="165,286 165,214 295,234 295,303" fill="#f7e0cf" stroke="#c3947a" strokeWidth="2" />
      <polygon points="316,300 316,254 424,273 424,324" fill="#f3d4be" stroke="#c3947a" strokeWidth="2" />
      {isGarden && <polygon points="447,277 447,242 610,267 610,307" fill="#d6e4d7" stroke="#7c9a83" strokeWidth="2" />}
      <text x="203" y="224" className={styles.svgText}>客餐厅</text><text x="344" y="209" className={styles.svgText}>卧室</text><text x="494" y="225" className={styles.svgText}>卧室/功能空间</text>
      <text x="462" y="289" className={styles.svgGreen}>{isGarden ? '户外空间示意' : '阳台/户外空间'}</text>
      <text x="130" y="350" className={styles.svgMuted}>入口动线</text><path d="M150 337 C245 365, 340 358, 420 335" fill="none" stroke="#c56f57" strokeWidth="3" strokeDasharray="7 7" /><path d="M420 335 l-12 -5 m12 5 l-9 9" fill="none" stroke="#c56f57" strokeWidth="3" />
      <g className={styles.compass}><circle cx="635" cy="61" r="25" fill="#302d29"/><text x="631" y="51">N</text><path d="M635 57 l-6 17 h12 z" fill="#ed8b6e"/></g>
    </svg>
    <div className={styles.modelLegend}><span><i className={styles.legendRoom} />室内功能区</span><span><i className={styles.legendGarden} />户外/阳台示意</span><span><i className={styles.legendPath} />动线示意</span></div>
  </div>;
}

function SourcePreview({ record }: { record: UnitRecord }) {
  return <div className={styles.sourceStage}>{record.sourceImage ? <img src={record.sourceImage} alt={`${record.source}原始资料`} /> : <div className={styles.sourceEmpty}><b>暂时没有可展示的原始图片</b><span>当前楼栋只有总平分布信息，待补逐层平面图。</span></div>}<div className={styles.sourceOverlay}>原始资料页 · 仅供核对</div></div>;
}

function DimensionsPreview({ record }: { record: UnitRecord }) {
  const profile = dimensionProfileFor(record);
  if (!profile) return <div className={styles.sourceStage}><div className={styles.sourceEmpty}><b>当前户型没有可确认的尺寸说明页</b><span>102㎡、129㎡不套用其他户型参数；待补原始尺寸图后再标注。</span></div></div>;
  return <div className={styles.dimensionStage}><div className={styles.dimensionImage}><img src={profile.image} alt={profile.title}/><div className={styles.sourceOverlay}>{profile.title} · 标线位置取自原图</div></div><div className={styles.dimensionFacts}>{profile.facts.map((fact) => <span key={fact}>{fact}</span>)}</div><small>{profile.sourceNote}；所有数字保留“约”，不作为交付尺寸。</small></div>;
}

function DataPreview({ record }: { record: UnitRecord }) {
  const rows=areaRowsFor(record);
  if(!rows.length)return <div className={styles.sourceStage}><div className={styles.sourceEmpty}><b>当前楼栋没有可确认的分户面积数据</b><span>不从其他楼栋套用数值。</span></div></div>;
  return <div className={styles.areaTableWrap}><div className={styles.areaTableHead}><div><b>{record.building} · {record.floor}层分户面积</b><span>已按原表的梯位、户号和楼层逐行整理</span></div><em>{rows.length}套</em></div><div className={styles.areaCards}>{rows.map((row)=><div className={styles.areaCard} key={`${row.slot}-${row.type}`}><div className={styles.areaCardTitle}><div><strong>{row.type}</strong><span>{row.slot}</span></div><em>实际得房率 {row.rate}</em></div><div className={styles.areaNumbers}><Metric label="产权面积" value={`${row.property}㎡`}/><Metric label="总赠送面积" value={`${row.gift}㎡`}/><Metric label="赠送比例" value={row.ratio}/>{row.indoor&&<Metric label="户内拓展" value={`${row.indoor}㎡`}/>}<Metric label="户外使用" value={`${row.outdoor}㎡`}/><Metric label="实际得房面积" value={`${row.actual}㎡`}/></div></div>)}</div><p className={styles.areaFoot}>数字来自上传的“分楼栋分户型楼层不计产权汇总”表；销售表达时请区分产权面积、赠送面积和户外使用。</p></div>;
}
