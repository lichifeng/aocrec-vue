<script setup>
import RecordTable from './RecordTable.vue';
import { watchEffect, inject, ref } from 'vue';

const mainKeywords = inject('mainKeywords');
const selectedFilters = inject('selectedFilters');
const queryBuilt = ref({});
const filters = inject('filters');

watchEffect(async () => {
    const must = [];
    if (mainKeywords.value) {
        const keywords = mainKeywords.value.trim().split(/\s+/).filter(k => k.length > 0);

        keywords.forEach(keyword => {
            must.push({
                bool: {
                    should: [
                        {
                            multi_match: {
                                query: keyword,
                                fields: [
                                    "speed^10",
                                    "ver^10",
                                    "guid^10",
                                    "md5^10",
                                    "matchup^10",
                                    "filename.keyword^5",
                                    "difficulty^3",
                                    "mapsize^3",
                                    "revealmap^3",
                                    "victorytype^3",
                                    "gametype^3",
                                    "mapname.keyword^3",
                                    "instructions^2",
                                    "mapname",
                                    "filename",
                                    "chat.content"
                                ]
                            }
                        },
                        {
                            nested: {
                                path: "players",
                                query: {
                                    bool: {
                                        should: [
                                            {
                                                match: {
                                                    "players.name": {
                                                        query: keyword
                                                    }
                                                }
                                            },
                                            {
                                                term: {
                                                    "players.name.keyword": {
                                                        value: keyword,
                                                        boost: 5,
                                                        case_insensitive: true
                                                    }
                                                }
                                            },
                                            {
                                                term: {
                                                    "players.civ": {
                                                        value: keyword,
                                                        boost: 5
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            });
        });
    }
    Object.entries(selectedFilters).forEach(([field, values]) => {
        if (values.value.length) {
            if (['ver', 'matchup'].includes(field)) {
                const should = [];
                values.value.forEach(v => {
                    if (v === 'others') {
                        should.push({
                            bool: {
                                must_not: {
                                    terms: {
                                        [field]: filters.value[field]
                                    }
                                }
                            }
                        });
                    } else {
                        should.push({
                            term: {
                                [field]: v
                            }
                        });
                    }
                });
                must.push({ bool: { should } });
            } else if (field === 'civs') {
                const civsMust = values.value.map(civ => ({
                    nested: {
                        path: "players",
                        query: {
                            term: {
                                "players.civ": civ
                            }
                        }
                    }
                }));
                must.push({ bool: { must: civsMust } });
            } else {
                must.push({
                    terms: {
                        [field]: values.value
                    }
                });
            }
        }
    });
    queryBuilt.value = must.length ? { bool: { must } } : { match_all: {} };
});
</script>

<template>
    <RecordTable :query="queryBuilt" />
</template>