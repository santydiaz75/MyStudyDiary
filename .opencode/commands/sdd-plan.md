---
description: SDD · Genera el plan técnico de una spec aprobada
agent: plan
--- 
Lee docs/constitution.md y specs/$1/spec.md. NO escribas
código. Genera specs/$1/plan.md con: qué archivos se crean o
modifican y qué responsabilidad tiene cada uno, qué funciones puras de lógica
se necesitan (con "hoy" como parámetro), algoritmo del mapa en pseudocódigo,
cómo se pinta en la interfaz, decisiones técnicas justificadas (y su
alternativa descartada) y estrategia de tests con node --test. Todo debe
respetar la constitución y cubrir todos los RF. Marca qué RF cubre cada parte. 