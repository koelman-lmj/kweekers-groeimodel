<section className="space-y-4 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
  <h2 className="text-lg font-medium">Domeinscores</h2>

  <div className="space-y-5">
    {domainScores.map((domain) => (
      <div key={domain.code} className="space-y-1.5">
        <div className="text-base font-semibold">{domain.title}</div>

        <div className="flex items-center gap-3 text-sm">
          <span className="shrink-0 text-muted-foreground">
            {getScoreLabel(domain.score)}
          </span>

          <div className="flex items-center gap-[2px]">
            {Array.from({ length: 10 }).map((_, index) => {
              const filledBlocks = Math.max(
                0,
                Math.min(10, Math.round(domain.score))
              );

              const isFilled = index < filledBlocks;

              return (
                <span
                  key={index}
                  className={
                    isFilled
                      ? "h-2.5 w-2.5 rounded-[2px] bg-black"
                      : "h-2.5 w-2.5 rounded-[2px] border border-black/20 bg-white"
                  }
                />
              );
            })}
          </div>

          <span className="shrink-0 text-sm font-medium">
            {domain.score.toFixed(1)}
          </span>
        </div>
      </div>
    ))}
  </div>
</section>
