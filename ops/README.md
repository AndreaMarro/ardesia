# ops/ — snapshot durabile dei file di setup della FABBRICA
Copie di runtime (deploy reale nei path live). Re-snapshot se cambiano.
- litellm/ : gateway LiteLLM (config.yaml + run-fg.sh + migrate*.sh). Deploy: ~/litellm/. launchd com.ardesia.litellm, 127.0.0.1:4000. Tetto-$ via Postgres+virtual-key.
- agentmemory-run.sh : wrapper agentmemory -> LiteLLM (capped). Deploy: ~/. launchd com.elab.agentmemory.
- launchd/ : i 3 plist (litellm, agentmemory, deadman). Deploy: ~/Library/LaunchAgents/.
SEGRETI (gitignored, NON qui): ~/litellm/.consumer-key (virtual-key capped). master-key LiteLLM = label locale 127.0.0.1 (sanitizzata nel run-fg snapshot). deepseek/kimi key lette a runtime da ~/lessonos/.env + ~/.hermes/config.yaml.
