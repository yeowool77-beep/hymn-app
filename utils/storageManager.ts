/**
 * 생성된 찬송가 데이터를 파일로 저장하는 유틸리티
 */

import { PromptData, HistoryItem } from '../types';
import { saveAs } from 'file-saver';

export class StorageManager {
    private static STORAGE_DIR = 'D:/찬송가_생성결과';

    /**
     * 개별 찬송가를 JSON 파일로 저장
     */
    static saveHymnToFile(hymn: HistoryItem) {
        const filename = `${hymn.titles.ko}_${Date.now()}.json`;
        const data = JSON.stringify(hymn, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        saveAs(blob, filename);
    }

    /**
     * 전체 히스토리를 JSON 파일로 내보내기
     */
    static exportAllHistory(history: HistoryItem[]) {
        const filename = `찬송가_전체_히스토리_${new Date().toISOString().split('T')[0]}.json`;
        const data = JSON.stringify(history, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        saveAs(blob, filename);
    }

    /**
     * Suno AI 프롬프트만 텍스트 파일로 내보내기
     */
    static exportSunoPrompts(history: HistoryItem[]) {
        const content = history.map((hymn, index) => {
            return `
===========================================
찬송가 ${index + 1}: ${hymn.titles.ko}
===========================================

[Style Prompt]
${hymn.stylePrompt}

[Lyrics - Korean]
${hymn.multiLyrics.ko}

[Lyrics - English]
${hymn.multiLyrics.en}

[Lyrics - Spanish]
${hymn.multiLyrics.es}

[Structure]
${hymn.structure.join(' → ')}

[Tags]
Genre: ${hymn.tags.genre}
BPM: ${hymn.tags.bpm}
Key: ${hymn.tags.key}
Vibe: ${hymn.tags.vibe}

[Suno Parameters]
Style Influence: ${hymn.sunoParameters.styleInfluence}
Weirdness: ${hymn.sunoParameters.weirdness}
Vocal Gender: ${hymn.sunoParameters.vocalGender}
Model: ${hymn.sunoParameters.recommendedModel}

`;
        }).join('\n\n');

        const filename = `Suno_프롬프트_모음_${new Date().toISOString().split('T')[0]}.txt`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, filename);
    }

    /**
     * CSV 형식으로 내보내기 (스프레드시트용)
     */
    static exportToCSV(history: HistoryItem[]) {
        const headers = ['번호', '한글제목', '영문제목', '장르', 'BPM', 'Key', '분위기', '생성일시'];
        const rows = history.map((hymn, index) => [
            index + 1,
            hymn.titles.ko,
            hymn.titles.en,
            hymn.tags.genre,
            hymn.tags.bpm,
            hymn.tags.key,
            hymn.tags.vibe,
            new Date(hymn.timestamp).toLocaleString('ko-KR')
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const filename = `찬송가_목록_${new Date().toISOString().split('T')[0]}.csv`;
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }); // UTF-8 BOM
        saveAs(blob, filename);
    }

    /**
     * 로컬 스토리지에서 데이터 로드
     */
    static loadFromLocalStorage(): HistoryItem[] {
        try {
            const saved = localStorage.getItem('sacred_architect_v5_core');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
            return [];
        }
    }

    /**
     * 로컬 스토리지에 데이터 저장
     */
    static saveToLocalStorage(history: HistoryItem[]) {
        try {
            localStorage.setItem('sacred_architect_v5_core', JSON.stringify(history));
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    }

    /**
     * 자동 백업 (5분마다)
     */
    static setupAutoBackup(history: HistoryItem[]) {
        setInterval(() => {
            if (history.length > 0) {
                this.exportAllHistory(history);
                console.log('✅ 자동 백업 완료:', new Date().toLocaleTimeString());
            }
        }, 5 * 60 * 1000); // 5분
    }
}
