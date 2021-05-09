import { Component, Injectable, Input, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BrowserService } from '../browser.service';
import { DataViewComponent } from '../data-view/data-view.component';


@Component({
    selector: 'app-file-browser',
    templateUrl: './file-browser.component.html',
    styleUrls: ['./file-browser.component.css']
})
export class FileBrowserComponent implements AfterViewInit {
    @Input() dataView: DataViewComponent | undefined;
    panelOpenState = false;
    browseTree: any;
    objectKeys = Object.keys;
    files: any;
    searchTimeout: any;
    loading: any = false;
    mapNameInput: any = "";
    searchFilter: SearchFilters = SEARCH_FILTERS;
    displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'loaded'];
    mapOrders: any = ["None", "Time Desc", "Time Asc", "Date Desc", "Date Asc"];
    mapOrderSelected: any = "None";
    limitSelected: any = "100";
    limits: any = ["100", "200", "300", "400"];
    data: RaceData[] = [];
    totalResults: any = 0;
    dataSource2 = new MatTableDataSource<RaceData>();
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    constructor(private browserService: BrowserService) {

    }
    ngAfterViewInit() {
        this.filterChanged(0);
    }
    limitChanged(e: any) {
        this.searchFilter.maxResults = e;
        this.filterChanged(0);
    }
    mapOrderChanged(e: any) {
        console.log(e);
        this.searchFilter.orderBy = e;
        this.filterChanged(0);
    }
    filterChanged(timeout: number) {
        clearInterval(this.searchTimeout);
        var that = this;
        this.searchTimeout = setTimeout(function () {
            that.loading = true;
            that.browserService.getFiles(that.searchFilter).subscribe(list => {
                that.totalResults = list.TotalResults;
                that.loading = false;
                that.data = [];
                list.Files.forEach((file: any) => {
                    file.dateStr = that.browserService.timeDifference(Date.now(), file.date);
                    file.endRaceTimeStr = that.browserService.getEndRaceTimeStr(file.endRaceTime.toString());
                    file.fileName = file.mapName + "_" + file.playerName + "_" + file.date + "_(" + file.endRaceTimeStr + ").tdj";
                    file.downloadUrl = "http://localhost:3000/download-race-data?filePath=" + file.file_path + "&fileName=" + file.fileName;
                    that.data.push(file);
                });
                that.dataSource2 = new MatTableDataSource<RaceData>(that.data);
                that.browseTree = list;
                that.paginator.pageSize = 10;
                that.dataSource2.paginator = that.paginator;
            },
                error => {
                    console.log(error);
                });
        }, timeout);
    }
    finishedCheckboxChanged(checked: any) {
        this.searchFilter.raceFinished = checked ? 1 : -1;
        console.log(checked, this.searchFilter.raceFinished);
        this.filterChanged(0);
    }
    mapCheckboxChanged(checked: any, raceData: any) {
        this.dataView?.toggleData2(checked, raceData);
    }
    loadAll() {
        var fileCheckboxes = document.getElementsByClassName("file-checkbox");
        for (var i = 0; i < fileCheckboxes.length; i++) {
            var checkbox = fileCheckboxes[i].querySelector('.mat-checkbox-input');
            
            if (checkbox) {
                var checked = checkbox.getAttribute("aria-checked");
                if (checked == "false") {
                    var evObj = document.createEvent('Events');
                    evObj.initEvent("click", true, false);
                    checkbox.dispatchEvent(evObj);
                }
            }
        }
    }
    unLoadAll() {
        var fileCheckboxes = document.getElementsByClassName("file-checkbox");
        for (var i = 0; i < fileCheckboxes.length; i++) {
            var checkbox = fileCheckboxes[i].querySelector('.mat-checkbox-input');
            
            if (checkbox) {
                var checked = checkbox.getAttribute("aria-checked");
                if (checked == "true") {
                    var evObj = document.createEvent('Events');
                    evObj.initEvent("click", true, false);
                    checkbox.dispatchEvent(evObj);
                }
            }
        }
    }
    mapNameInputChanged() {
        this.searchFilter.mapName = this.mapNameInput;
        this.filterChanged(300);
    }
}

export interface SearchFilters {
    mapName: string,
    playerName: string,
    endRaceTimeMin: number,
    endRaceTimeMax: number,
    raceFinished: number,
    dateMin: Date,
    maxResults: number,
    orderBy: string
}

const SEARCH_FILTERS: SearchFilters = {
    mapName: "",
    playerName: "",
    endRaceTimeMin: -1,
    endRaceTimeMax: -1,
    raceFinished: -1,
    dateMin: new Date(),
    maxResults: 100,
    orderBy: "None"
}

export interface RaceData {
    mapName: string,
    mapUId: string,
    authorName: string,
    playerName: string,
    playerLogin: string,
    playerWebId: string,
    endRaceTime: number,
    raceFinished: number,
    filePath: string,
    date: Date
}
